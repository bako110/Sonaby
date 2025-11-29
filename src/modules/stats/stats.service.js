const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class StatsService {
  async getAllStats() {
    try {
      const [
        // Statistiques globales
        totalVisitors,
        totalVisits,
        visitsToday,
        activeVisits,
        
        // Statistiques admin
        totalSites,
        totalCheckpoints,
        totalAgents,
        recentBlacklistHits,
        totalSosAlerts,
        
        // Données pour graphiques
        visitsTrend,
        appointmentsTrend,
        visitsByType,
        appointmentsByStatus,
        incidentsByCategory,
        
        // Checkpoints status
        checkpointsOnline,
        checkpointsTotal,
        sosActive,
        blacklistAttemptsToday,
        
        // Service stats
        myAgentsTotal,
        myAgentsActive,
        myServiceAppointmentsToday,
        myServicePendingAppointments,
        incidentsInMyService,
        
        // Top visitors et agent performance
        topVisitors,
        agentPerformance,
        
        // Busy checkpoints
        busyCheckpoints,
        
        // Hourly traffic
        hourlyTraffic
      ] = await Promise.all([
        // Total visitors
        prisma.visitor.count(),
        
        // Total visits
        prisma.visit.count(),
        
        // Visits today
        prisma.visit.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }),
        
        // Active visits
        prisma.visit.count({
          where: {
            exitTime: null
          }
        }),
        
        // Admin stats
        prisma.site.count(),
        prisma.checkpoint.count(),
        prisma.user.count({
          where: {
            role: 'AGENT_CONTROLE'
          }
        }),
        
        // Recent blacklist hits (last 7 days)
        prisma.blacklistHistory.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        
        // Total SOS alerts
        prisma.SosAlert.count(),
        
        // Visits trend (last 30 days)
        this.getVisitsTrend(),
        
        // Appointments trend (last 30 days)
        this.getAppointmentsTrend(),
        
        // Visits by type
        this.getVisitsByType(),
        
        // Appointments by status
        this.getAppointmentsByStatus(),
        
        // Incidents by category
        this.getIncidentsByCategory(),
        
        // Checkpoints online/total
        this.getCheckpointStatus(),
        
        // SOS active (non résolus)
        prisma.SosAlert.count({
          where: {
            isResolved: false
          }
        }),
        
        // Blacklist attempts today
        prisma.blacklistHistory.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }),
        
        // Service stats (all agents)
        prisma.user.count({
          where: {
            role: 'AGENT_CONTROLE'
          }
        }),
        
        prisma.user.count({
          where: {
            role: 'AGENT_CONTROLE',
            isActive: true
          }
        }),
        
        // Appointments today
        prisma.Rendezvous.count({
          where: {
            visitDate: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }),
        
        // Pending appointments
        prisma.Rendezvous.count({
          where: {
            status: 'PENDING'
          }
        }),
        
        // Incidents in service (all)
        prisma.visitIncident.count(),
        
        // Top visitors
        this.getTopVisitors(),
        
        // Agent performance
        this.getAgentPerformance(),
        
        // Busy checkpoints
        this.getBusyCheckpoints(),
        
        // Hourly traffic
        this.getHourlyTraffic()
      ]);

      // System health calculation
      const systemHealth = await this.calculateSystemHealth();
      
      // Sites status
      const sitesStatus = await this.getSitesStatus();
      
      // Peak hour
      const peakHour = this.getPeakHour(hourlyTraffic);

      return {
        // --- GLOBAL ---
        totalVisitors,
        totalVisits,
        visitsToday,
        activeVisits,

        // --- ADMIN ---
        adminStats: {
          totalSites,
          totalCheckpoints,
          totalAgents,
          systemHealth,
          sitesStatus,
          recentBlacklistHits,
          totalSosAlerts
        },

        // --- SERVICE ---
        serviceStats: {
          myAgentsTotal,
          myAgentsActive,
          myServiceAppointmentsToday: myServiceAppointmentsToday,
          myServicePendingAppointments: myServicePendingAppointments,
          incidentsInMyService,
          topVisitors,
          agentPerformance
        },

        // --- OPERATIONAL ---
        operationalStats: {
          checkpointsOnline,
          checkpointsTotal,
          busyCheckpoints,
          sosActive,
          blacklistAttemptsToday,
          hourlyTraffic,
          peakHour
        },

        // --- GRAPHIQUES ---
        visitsTrend,
        appointmentsTrend,
        visitsByType,
        appointmentsByStatus,
        incidentsByCategory
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  async getVisitsTrend() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const visits = await prisma.visit.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: {
        id: true
      }
    });

    // Generate last 30 days with visit counts
    const trend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayVisits = visits.find(v => 
        v.createdAt.toISOString().split('T')[0] === dateStr
      );
      
      trend.push({
        date: dateStr,
        value: dayVisits?._count.id || 0
      });
    }

    return trend;
  }

  async getAppointmentsTrend() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const appointments = await prisma.Rendezvous.groupBy({
      by: ['visitDate'],
      where: {
        visitDate: {
          gte: thirtyDaysAgo
        }
      },
      _count: {
        id: true
      }
    });

    // Generate last 30 days with appointment counts
    const trend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayAppointments = appointments.find(a => 
        a.visitDate.toISOString().split('T')[0] === dateStr
      );
      
      trend.push({
        date: dateStr,
        value: dayAppointments?._count.id || 0
      });
    }

    return trend;
  }

  async getVisitsByType() {
    const visits = await prisma.visit.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    const result = {};
    visits.forEach(v => {
      result[v.status || 'Non défini'] = v._count.id;
    });

    return result;
  }

  async getAppointmentsByStatus() {
    const appointments = await prisma.Rendezvous.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    const result = {};
    appointments.forEach(a => {
      result[a.status || 'Non défini'] = a._count.id;
    });

    return result;
  }

  async getIncidentsByCategory() {
    const incidents = await prisma.visitIncident.groupBy({
      by: ['severityLevel'],
      _count: {
        id: true
      }
    });

    const result = {};
    incidents.forEach(i => {
      const level = i.severityLevel || 0;
      result[`Niveau ${level}`] = i._count.id;
    });

    return result;
  }

  async getCheckpointStatus() {
    const total = await prisma.checkpoint.count();
    const online = await prisma.checkpoint.count({
      where: {
        active: true,
        status: 'active'
      }
    });

    return {
      online,
      total
    };
  }

  async getTopVisitors() {
    const visitors = await prisma.visitor.findMany({
      include: {
        _count: {
          select: {
            visits: true
          }
        }
      },
      orderBy: {
        visits: {
          _count: 'desc'
        }
      },
      take: 10
    });

    return visitors.map(v => ({
      name: `${v.firstName} ${v.lastName}`,
      count: v._count.visits
    }));
  }

  async getAgentPerformance() {
    const agents = await prisma.user.findMany({
      where: {
        role: 'AGENT_CONTROLE'
      },
      include: {
        _count: {
          select: {
            createdVisits: true
          }
        }
      },
      take: 10
    });

    return agents.map(a => ({
      name: `${a.firstName} ${a.lastName}`,
      visitsHandled: a._count.createdVisits
    }));
  }

  async getBusyCheckpoints() {
    // Get checkpoints with most active visits
    const checkpoints = await prisma.checkpoint.findMany({
      include: {
        _count: {
          select: {
            visits: {
              where: {
                exitTime: null
              }
            }
          }
        },
        site: {
          select: {
            name: true
          }
        }
      },
      where: {
        active: true
      },
      orderBy: {
        visits: {
          _count: 'desc'
        }
      },
      take: 10
    });

    return checkpoints
      .filter(c => c._count.visits > 0)
      .map(c => ({
        name: `${c.name} - ${c.site.name}`,
        queue: c._count.visits
      }));
  }

  async getHourlyTraffic() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const visits = await prisma.visit.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: {
            gte: today
          }
        },
        _count: {
          id: true
        }
      });

      // Initialize 24 hours with 0
      const hourlyTraffic = new Array(24).fill(0);

      visits.forEach(v => {
        const hour = v.createdAt.getHours();
        hourlyTraffic[hour] += v._count.id;
      });

      return hourlyTraffic;
    } catch (error) {
      console.error('Error in getHourlyTraffic:', error);
      // Return default array if error occurs
      return new Array(24).fill(0);
    }
  }

  async calculateSystemHealth() {
    try {
      const [totalCheckpoints, activeCheckpoints, totalAgents, activeAgents] = await Promise.all([
        prisma.checkpoint.count(),
        prisma.checkpoint.count({ where: { active: true, status: 'active' } }),
        prisma.user.count({ where: { role: 'AGENT_CONTROLE' } }),
        prisma.user.count({ where: { role: 'AGENT_CONTROLE', isActive: true } })
      ]);

      const checkpointHealth = totalCheckpoints > 0 ? (activeCheckpoints / totalCheckpoints) * 100 : 100;
      const agentHealth = totalAgents > 0 ? (activeAgents / totalAgents) * 100 : 100;
      
      return Math.round((checkpointHealth + agentHealth) / 2);
    } catch (error) {
      return 85; // Default fallback
    }
  }

  async getSitesStatus() {
    const sites = await prisma.site.findMany({
      include: {
        _count: {
          select: {
            checkpoints: true
          }
        }
      }
    });

    return sites.map(site => {
      const checkpointCount = site._count.checkpoints;
      
      // Simple status calculation based on checkpoint count
      let status = 'OK'; // Possible values: 'OK', 'WARNING', 'ERROR'
      let load = 0;

      if (checkpointCount === 0) {
        status = 'ERROR';
        load = 0;
      } else if (checkpointCount < 3) {
        status = 'WARNING';
        load = checkpointCount * 25;
      } else {
        load = Math.min(100, checkpointCount * 20);
      }

      return {
        name: site.name,
        status,
        load
      };
    });
  }

  getPeakHour(hourlyTraffic) {
    if (!hourlyTraffic || !Array.isArray(hourlyTraffic) || hourlyTraffic.length === 0) {
      return "00:00";
    }
    
    const maxVisits = Math.max(...hourlyTraffic);
    const peakHour = hourlyTraffic.indexOf(maxVisits);
    
    return `${peakHour.toString().padStart(2, '0')}:00`;
  }
}

module.exports = new StatsService();
