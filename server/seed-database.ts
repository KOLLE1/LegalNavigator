import bcrypt from 'bcrypt';
import { db } from './db';
import { users, lawyers } from '../shared/schema-pg';

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with default accounts...');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);
    const lawyerPassword = await bcrypt.hash('lawyer123', 10);

    // Create admin user
    const [adminUser] = await db.insert(users).values({
      email: 'admin@lawhelp.cm',
      name: 'System Administrator',
      passwordHash: adminPassword,
      isLawyer: false,
      emailVerified: true,
      phone: '+237123456789',
      location: 'Yaoundé, Cameroon'
    }).returning();

    console.log('✅ Admin user created:', adminUser.email);

    // Create regular user
    const [regularUser] = await db.insert(users).values({
      email: 'user@lawhelp.cm',
      name: 'John Doe',
      passwordHash: userPassword,
      isLawyer: false,
      emailVerified: true,
      phone: '+237987654321',
      location: 'Douala, Cameroon'
    }).returning();

    console.log('✅ Regular user created:', regularUser.email);

    // Create lawyer user
    const [lawyerUser] = await db.insert(users).values({
      email: 'lawyer@lawhelp.cm',
      name: 'Dr. Marie Ngozi',
      passwordHash: lawyerPassword,
      isLawyer: true,
      emailVerified: true,
      phone: '+237555123456',
      location: 'Yaoundé, Cameroon'
    }).returning();

    console.log('✅ Lawyer user created:', lawyerUser.email);

    // Create lawyer profile
    await db.insert(lawyers).values({
      userId: lawyerUser.id,
      licenseNumber: 'BAR-CM-2018-001',
      specialization: 'Corporate Law',
      experienceYears: 8,
      practiceAreas: ['Corporate Law', 'Contract Law', 'Business Formation', 'Mergers & Acquisitions'],
      languages: ['English', 'French'],
      officeAddress: '123 Independence Avenue, Yaoundé, Cameroon',
      description: 'Experienced corporate lawyer specializing in business law and commercial transactions in Cameroon.',
      hourlyRate: 50000, // CFA Francs
      verified: true,
      rating: 5,
      totalReviews: 12
    });

    console.log('✅ Lawyer profile created for:', lawyerUser.name);

    // Create another lawyer
    const [lawyer2User] = await db.insert(users).values({
      email: 'lawyer2@lawhelp.cm',
      name: 'Maître Paul Biya',
      passwordHash: lawyerPassword,
      isLawyer: true,
      emailVerified: true,
      phone: '+237666789012',
      location: 'Douala, Cameroon'
    }).returning();

    await db.insert(lawyers).values({
      userId: lawyer2User.id,
      licenseNumber: 'BAR-CM-2015-045',
      specialization: 'Criminal Law',
      experienceYears: 12,
      practiceAreas: ['Criminal Defense', 'Family Law', 'Personal Injury'],
      languages: ['French', 'English'],
      officeAddress: '456 Commercial Street, Douala, Cameroon',
      description: 'Senior criminal defense attorney with extensive experience in Cameroon courts.',
      hourlyRate: 75000, // CFA Francs
      verified: true,
      rating: 4,
      totalReviews: 28
    });

    console.log('✅ Second lawyer profile created for:', lawyer2User.name);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Default Login Credentials:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│                   ADMIN ACCOUNT                        │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ Email:    admin@lawhelp.cm                             │');
    console.log('│ Password: admin123                                     │');
    console.log('│ Role:     Administrator                                │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│                   USER ACCOUNT                         │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ Email:    user@lawhelp.cm                              │');
    console.log('│ Password: user123                                      │');
    console.log('│ Role:     Regular User                                 │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│                  LAWYER ACCOUNTS                       │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ Email:    lawyer@lawhelp.cm                            │');
    console.log('│ Password: lawyer123                                    │');
    console.log('│ Name:     Dr. Marie Ngozi                              │');
    console.log('│ Specialization: Corporate Law                          │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ Email:    lawyer2@lawhelp.cm                           │');
    console.log('│ Password: lawyer123                                    │');
    console.log('│ Name:     Maître Paul Biya                             │');
    console.log('│ Specialization: Criminal Law                           │');
    console.log('└─────────────────────────────────────────────────────────┘');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    
    if (error instanceof Error && error.message.includes('duplicate key')) {
      console.log('ℹ️  Default users already exist. Skipping seeding.');
      console.log('\n📋 Use these existing credentials:');
      console.log('Admin: admin@lawhelp.cm / admin123');
      console.log('User: user@lawhelp.cm / user123');
      console.log('Lawyer: lawyer@lawhelp.cm / lawyer123');
      console.log('Lawyer 2: lawyer2@lawhelp.cm / lawyer123');
    } else {
      throw error;
    }
  }
}

export { seedDatabase };