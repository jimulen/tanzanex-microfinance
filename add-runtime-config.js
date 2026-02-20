#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const routes = [
    'auth/login/route.ts',
    'auth/register/route.ts',
    'borrowers/route.ts',
    'cashflow/route.ts',
    'dashboard/loans-repayments/route.ts',
    'dashboard/metrics/route.ts',
    'expenses/route.ts',
    'groups/[id]/members/route.ts',
    'groups/route.ts',
    'loans/route.ts',
    'members/[id]/route.ts',
    'members/route.ts',
    'repayments/route.ts',
    'seed/admin/route.ts',
    'setup/route.ts',
    'staff/[id]/route.ts',
    'staff/login/route.ts',
    'staff/register/route.ts',
    'staff/route.ts',
    'subscription/status/route.ts',
    'system/reset/route.ts'
];

const apiDir = path.join(__dirname, 'app', 'api');

routes.forEach(route => {
    const filePath = path.join(apiDir, route);

    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Check if runtime export already exists
        if (!content.includes('export const runtime')) {
            // Find the last import statement
            const lines = content.split('\n');
            let lastImportIndex = -1;

            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim().startsWith('import ')) {
                    lastImportIndex = i;
                }
            }

            // Insert runtime export after last import
            if (lastImportIndex >= 0) {
                lines.splice(lastImportIndex + 1, 0, '', "export const runtime = 'nodejs';");
                content = lines.join('\n');
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`✓ Added runtime config to ${route}`);
            }
        } else {
            console.log(`- Skipped ${route} (already has runtime config)`);
        }
    } else {
        console.log(`✗ File not found: ${route}`);
    }
});

console.log('\nDone!');
