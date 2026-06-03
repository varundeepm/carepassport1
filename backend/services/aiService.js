const PatientDisease = require('../models/PatientDisease');
const Disease = require('../models/Disease');

const aiService = {
    /**
     * Find similar patients based on shared disease patterns
     */
    findSimilarPatients: async (targetPatientId) => {
        try {
            // 1. Get diseases for the target patient
            const targetPatientDiseases = await PatientDisease.find({ patientId: targetPatientId });
            if (!targetPatientDiseases.length) {
                return { success: true, similarPatients: [], message: 'No disease history found for this patient' };
            }

            const diseaseIds = targetPatientDiseases.map(pd => pd.diseaseId);

            // 2. Find other patients with at least one shared disease
            const matches = await PatientDisease.find({
                patientId: { $ne: targetPatientId },
                diseaseId: { $in: diseaseIds }
            }).limit(20);

            // 3. Simple scoring (count shared diseases)
            const patientScores = {};
            for (const match of matches) {
                if (!patientScores[match.patientId]) {
                    patientScores[match.patientId] = {
                        patientId: match.patientId,
                        sharedDiseases: [],
                        score: 0
                    };
                }
                patientScores[match.patientId].sharedDiseases.push(match.diseaseId);
                patientScores[match.patientId].score += 1;
            }

            // Convert to array and sort by score
            const results = Object.values(patientScores)
                .sort((a, b) => b.score - a.score)
                .slice(0, 5);

            return {
                success: true,
                patientId: targetPatientId,
                similarPatients: results
            };
        } catch (error) {
            console.error('Error in AI similarity analysis:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Mock prediction for medication adherence
     */
    predictAdherence: async (patientId) => {
        // In a real app, this would use a ML model (TensorFlow/PyTorch)
        // Here we use a rule-based mock
        const history = await PatientDisease.find({ patientId });

        let adherenceScore = 0.85; // baseline

        // Adjust based on status
        history.forEach(h => {
            if (h.currentStatus === 'chronic') adherenceScore -= 0.05;
            if (h.severity === 'severe') adherenceScore += 0.05; // severe patients might be more careful?
        });

        return {
            success: true,
            patientId,
            predictedAdherence: Math.min(Math.max(adherenceScore, 0.4), 0.99),
            riskLevel: adherenceScore < 0.6 ? 'High' : (adherenceScore < 0.8 ? 'Medium' : 'Low')
        };
    }
};

module.exports = aiService;
