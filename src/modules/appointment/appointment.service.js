const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AppointmentService {
 async createAppointment(appointmentData) {
    try {
      // Vérifier que l'organisateur existe
      const organizer = await prisma.user.findUnique({
        where: { id: appointmentData.organizerId }
      });

      if (!organizer) {
        throw new Error('Organisateur non trouvé');
      }

      // Vérifier que le site existe
      if (appointmentData.siteId) {
        const site = await prisma.site.findUnique({
          where: { id: appointmentData.siteId }
        });

        if (!site) {
          throw new Error('Site non trouvé');
        }
      }

      // Traitement des dates
      const processedData = {
        ...appointmentData,
        // Conserver la date de visite telle quelle (sans modification)
        visitDate: appointmentData.visitDate ? new Date(appointmentData.visitDate) : null,
        
        // Pour les heures, si c'est déjà un Date, le garder, sinon créer avec la date d'aujourd'hui
        startTime: appointmentData.startTime 
          ? (appointmentData.startTime instanceof Date 
              ? appointmentData.startTime 
              : this.parseTimeToToday(appointmentData.startTime))
          : null,
          
        endTime: appointmentData.endTime 
          ? (appointmentData.endTime instanceof Date 
              ? appointmentData.endTime 
              : this.parseTimeToToday(appointmentData.endTime))
          : null,
        
        // Ajouter la date de création actuelle
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const appointment = await prisma.rendezvous.create({
        data: processedData,
        include: {
          organizer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          },
          site: appointmentData.siteId ? {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              country: true
            }
          } : undefined
        }
      });
      return appointment;
    } catch (error) {
      console.error('❌ Erreur lors de la création du rendez-vous:', error);
      throw error;
    }
  }

  // Méthode utilitaire pour convertir une heure en Date avec la date d'aujourd'hui
  parseTimeToToday(timeString) {
    try {
      // Si c'est déjà un objet Date, le retourner
      if (timeString instanceof Date) {
        return timeString;
      }

      // Si c'est une chaîne de caractères, la parser
      if (typeof timeString === 'string') {
        const today = new Date();
        const [hours, minutes, seconds = '00'] = timeString.split(':');
        
        // Créer une nouvelle date avec la date d'aujourd'hui et l'heure fournie
        const dateWithTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 
                                      parseInt(hours), parseInt(minutes), parseInt(seconds));
        
        return dateWithTime;
      }

      // Si ce n'est ni une Date ni une string, retourner null
      return null;
    } catch (error) {
      console.warn('⚠️ Erreur lors du parsing de l\'heure:', timeString, error);
      return null;
    }
  }

  async getAllAppointments(page = 1, limit = 10, search = null, organizerId = null, siteId = null, firstName = null, lastName = null, serviceName = null, status = null) {
    try {
      const skip = (page - 1) * limit;
      
      const whereClause = {};
      
      if (organizerId) whereClause.organizerId = organizerId;
      if (siteId) whereClause.siteId = siteId;
      if (firstName) whereClause.firstName = { contains: firstName, mode: 'insensitive' };
      if (lastName) whereClause.lastName = { contains: lastName, mode: 'insensitive' };
      if (serviceName) whereClause.serviceName = { contains: serviceName, mode: 'insensitive' };
      if (status) whereClause.status = status;
      if (search) {
        whereClause.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { serviceName: { contains: search, mode: 'insensitive' } },
          { reason: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [appointments, total] = await Promise.all([
        prisma.rendezvous.findMany({
          where: whereClause,
          include: {
            organizer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            },
            site: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
                country: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.rendezvous.count({ where: whereClause })
      ]);

      return {
        appointments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
      throw error;
    }
  }

  async getAppointmentById(id) {
    try {
      const appointment = await prisma.rendezvous.findUnique({
        where: { id },
        include: {
          organizer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          },
          site: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              country: true
            }
          }
        }
      });

      if (!appointment) {
        throw new Error('Rendez-vous non trouvé');
      }

      return appointment;
    } catch (error) {
      console.error('Erreur lors de la récupération du rendez-vous:', error);
      throw error;
    }
  }

  async updateAppointment(id, updateData) {
    try {
      const existingAppointment = await this.getAppointmentById(id);

      const updatedAppointment = await prisma.rendezvous.update({
        where: { id },
        data: {
          ...updateData,
          visitDate: updateData.visitDate ? new Date(updateData.visitDate) : undefined,
          startTime: updateData.startTime ? new Date(`1970-01-01T${updateData.startTime}`) : undefined,
          endTime: updateData.endTime ? new Date(`1970-01-01T${updateData.endTime}`) : undefined
        },
        include: {
          organizer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          },
          site: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              country: true
            }
          }
        }
      });

      return updatedAppointment;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rendez-vous:', error);
      throw error;
    }
  }

  async deleteAppointment(id) {
    try {
      const existingAppointment = await this.getAppointmentById(id);

      await prisma.rendezvous.delete({
        where: { id }
      });

      return { message: 'Rendez-vous supprimé avec succès' };
    } catch (error) {
      console.error('Erreur lors de la suppression du rendez-vous:', error);
      throw error;
    }
  }

  async generateQRCode(id) {
    try {
      const appointment = await this.getAppointmentById(id);
      
      // Générer les données pour le QR code
      const qrData = {
        appointmentId: appointment.id,
        firstName: appointment.firstName,
        lastName: appointment.lastName,
        visitDate: appointment.visitDate,
        siteName: appointment.site.name,
        serviceName: appointment.serviceName
      };

      // Pour l'instant, retourner les données du QR code
      // Dans une implémentation réelle, vous pourriez utiliser une librairie comme qrcode
      return {
        qrData: JSON.stringify(qrData),
        appointment: {
          id: appointment.id,
          firstName: appointment.firstName,
          lastName: appointment.lastName,
          site: appointment.site,
          visitDate: appointment.visitDate
        }
      };
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
      throw error;
    }
  }

  async getRendezvousBySite(siteId) {
  if (!siteId) {
    throw new Error("Le siteId doit être fourni");
  }

  try {
    // Vérifier si le site existe
    const siteExists = await prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true }
    });

    if (!siteExists) {
      throw new Error("Le site spécifié n'existe pas");
    }

    // 🔹 Calcul du lundi et dimanche de la semaine
    const today = new Date();
    const currentDay = today.getDay(); // 0 = dimanche, 1 = lundi ...
    const mondayOffset = currentDay === 0 ? 6 : currentDay - 1;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Récupérer les rendez-vous pour le site et la semaine
    const rendezvousList = await prisma.rendezvous.findMany({
      where: {
        siteId,
        visitDate: {
          gte: weekStart,
          lte: weekEnd
        }
      },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        site: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            country: true
          }
        }
      },
      orderBy: {
        visitDate: 'asc'
      }
    });

    if (!rendezvousList.length) {
      return {
        success: true,
        total: 0,
        data: [],
        message: "Aucun rendez-vous trouvé pour ce site cette semaine"
      };
    }

    return {
      success: true,
      total: rendezvousList.length,
      data: rendezvousList
    };
  } catch (error) {
    throw new Error(`Erreur lors de la récupération des rendez-vous: ${error.message}`);
  }
}

}

module.exports = new AppointmentService();
