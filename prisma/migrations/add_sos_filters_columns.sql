-- Migration pour ajouter les champs statut, priorite et typeIncident dans sos_alerts

ALTER TABLE sos_alerts 
ADD COLUMN statut VARCHAR(20) DEFAULT 'MEDIUM',
ADD COLUMN priorite VARCHAR(50) DEFAULT 'NORMAL', 
ADD COLUMN type_incident VARCHAR(50) DEFAULT 'GENERAL';

-- Ajouter les index pour améliorer les performances de filtrage
CREATE INDEX idx_sos_alerts_statut ON sos_alerts(statut);
CREATE INDEX idx_sos_alerts_priorite ON sos_alerts(priorite);  
CREATE INDEX idx_sos_alerts_type_incident ON sos_alerts(type_incident);

-- Optionnel: Mettre à jour les enregistrements existants avec des valeurs par défaut
UPDATE sos_alerts SET 
  statut = 'MEDIUM',
  priorite = 'NORMAL', 
  type_incident = 'GENERAL'
WHERE statut IS NULL OR priorite IS NULL OR type_incident IS NULL;