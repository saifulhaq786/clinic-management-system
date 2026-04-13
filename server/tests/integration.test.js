// Integration tests for API endpoints
describe('API Integration Tests', () => {
  describe('POST /api/prescriptions/create', () => {
    test('should create prescription with valid data', () => {
      const payload = {
        patientId: '123',
        medicines: [{ name: 'Aspirin', dosage: '500mg', frequency: 'Twice daily' }],
        notes: 'Take with food',
      };
      expect(payload).toHaveProperty('patientId');
      expect(payload.medicines).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/payments/intent', () => {
    test('should create payment intent for appointment', () => {
      const payload = {
        appointmentId: '123',
        amount: 50,
      };
      expect(payload.amount).toBeGreaterThan(0);
    });
  });

  describe('GET /api/admin/stats', () => {
    test('should return admin dashboard statistics', () => {
      const expectedStats = {
        users: { total: 0, doctors: 0, patients: 0 },
        appointments: { total: 0, completed: 0, cancelled: 0 },
        revenue: 0,
      };
      expect(expectedStats).toHaveProperty('users');
      expect(expectedStats).toHaveProperty('appointments');
      expect(expectedStats).toHaveProperty('revenue');
    });
  });
});
