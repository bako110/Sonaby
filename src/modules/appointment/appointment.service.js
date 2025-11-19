const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

class AppointmentService {
  async createAppointment(appointmentData) {
    try {
      // Vérifier que le visiteur existe
      const visitor = await prisma.visitor.findUnique({
        where: { id: appointmentData.visitorId }
      });

      if (!visitor) {
        throw new Error('Visiteur non trouvé');
      }

      // Vérifier que le service existe
      const service = await prisma.service.findUnique({
        where: { id: appointmentData.serviceId }
      });

      if (!service) {
        throw new Error('Service non trouvé');
      }

      // Générer un QR code unique
      const qrCode = uuidv4();

      const appointment = await prisma.appointment.create({
        data: {
          ...appointmentData,
          dateStart: new Date(appointmentData.dateStart),
          dateEnd: new Date(appointmentData.dateEnd),
          qrCode
        },
        include: {
          visitor: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              company: true
            }
          },
          service: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      return appointment;
    } catch (error) {
      throw new Error(`Erreur lors de la création du rendez-vous: ${error.message}`);
    }
  }

  async getAllAppointments(page = 1, limit = 10, search = null, visitorId = null, serviceId = null, upcoming = false) {
    try {
      const skip = (page - 1) * limit;
      
      let whereClause = {};
      
      if (search) {
        whereClause.OR = [
          { personVisited: { contains: search, mode: 'insensitive' } },
          { visitor: { 
            OR: [
              { firstname: { contains: search, mode: 'insensitive' } },
              { lastname: { contains: search, mode: 'insensitive' } }
            ]
          }}
        ];
      }

      if (visitorId) {
        whereClause.visitorId = visitorId;
      }

      if (serviceId) {
        whereClause.serviceId = serviceId;
      }

      if (upcoming) {
        whereClause.dateStart = { gte: new Date() };
      }

      const [appointments, total] = await Promise.all([
        prisma.appointment.findMany({
          where: whereClause,
          skip,
          take: limit,
          include: {
            visitor: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                company: true
              }
            },
            service: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            dateStart: 'desc'
          }
        }),
        prisma.appointment.count({ where: whereClause })
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
      throw new Error(`Erreur lors de la récupération des rendez-vous: ${error.message}`);
    }
  }

  async getAppointmentById(id) {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
          visitor: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              phone: true,
              company: true
            }
          },
          service: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      
      if (!appointment) {
        throw new Error('Rendez-vous non trouvé');
      }

      return appointment;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du rendez-vous: ${error.message}`);
    }
  }

  async updateAppointment(id, updateData) {
    try {
      const existingAppointment = await this.getAppointmentById(id);
      
      const dataToUpdate = { ...updateData };
      if (updateData.dateStart) {
        dataToUpdate.dateStart = new Date(updateData.dateStart);
      }
      if (updateData.dateEnd) {
        dataToUpdate.dateEnd = new Date(updateData.dateEnd);
      }

      const updatedAppointment = await prisma.appointment.update({
        where: { id },
        data: dataToUpdate,
        include: {
          visitor: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              company: true
            }
          },
          service: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      return updatedAppointment;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du rendez-vous: ${error.message}`);
    }
  }

  async deleteAppointment(id) {
    try {
      const existingAppointment = await this.getAppointmentById(id);
      
      await prisma.appointment.delete({
        where: { id }
      });

      return { message: 'Rendez-vous supprimé avec succès' };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du rendez-vous: ${error.message}`);
    }
  }

  async generateQRCode(id) {
    try {
      const appointment = await this.getAppointmentById(id);
      
      // Le QR code est déjà généré lors de la création
      return {
        appointmentId: appointment.id,
        qrCode: appointment.qrCode,
        visitor: appointment.visitor,
        service: appointment.service,
        dateStart: appointment.dateStart,
        dateEnd: appointment.dateEnd
      };
    } catch (error) {
      throw new Error(`Erreur lors de la génération du QR code: ${error.message}`);
    }
  }
}

module.exports = new AppointmentService();
