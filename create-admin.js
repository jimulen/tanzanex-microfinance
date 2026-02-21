const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tanzanex', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Admin Schema
const AdminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
}, { timestamps: true });

const Admin = mongoose.model('Admin', AdminSchema);

async function createAdmin() {
    try {
        console.log('Checking for existing admins...');
        
        // Check if any admins exist
        const existingAdmins = await Admin.find({});
        console.log(`Found ${existingAdmins.length} existing admins`);
        
        if (existingAdmins.length > 0) {
            console.log('Existing admins:');
            existingAdmins.forEach(admin => {
                console.log(`- ${admin.email} (${admin.role})`);
            });
            return;
        }
        
        // Create a super admin if none exist
        console.log('Creating super admin...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        const superAdmin = new Admin({
            email: 'admin@tanzanex.com',
            password: hashedPassword,
            role: 'super-admin'
        });
        
        await superAdmin.save();
        console.log('✅ Super admin created successfully!');
        console.log('Email: admin@tanzanex.com');
        console.log('Password: admin123');
        console.log('Role: super-admin');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
}

createAdmin();
