#!/usr/bin/env node
const dns = require('dns').promises;
const fs = require('fs');
const path = require('path');

async function check() {
  console.log("🔍 Checking DNS propagation for deeveecapital.com...\n");
  
  try {
    const aRecords = await dns.resolve4('deeveecapital.com');
    console.log("A Records:", aRecords);
    if (aRecords.includes('199.36.158.100')) {
      console.log("✅ Google Cloud IP (199.36.158.100) is ACTIVE!");
    } else {
      console.log("⏳ Still pointing to old IP(s):", aRecords);
    }
  } catch (e) {
    console.log("❌ A Record query error:", e.message);
  }

  try {
    const txtRecords = await dns.resolveTxt('deeveecapital.com');
    const flat = txtRecords.flat();
    console.log("\nTXT Records:", flat);
    if (flat.some(r => r.includes('hosting-site=deeveecapital-site'))) {
      console.log("✅ Google ownership TXT verified!");
    } else {
      console.log("⏳ Ownership TXT not detected yet");
    }
  } catch (e) {
    console.log("❌ TXT query error:", e.message);
  }

  try {
    const cnameRecords = await dns.resolveCname('www.deeveecapital.com');
    console.log("\nWWW CNAME:", cnameRecords);
    if (cnameRecords.includes('deeveecapital-site.web.app')) {
      console.log("✅ CNAME points to deeveecapital-site.web.app!");
    }
  } catch (e) {
    console.log("⏳ WWW CNAME not resolved yet:", e.message);
  }

  // Check Firebase Custom Domain API
  try {
    const configPath = path.join(process.env.HOME, '.config/configstore/firebase-tools.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const token = config.tokens?.access_token;
      if (token) {
        const res = await fetch('https://firebasehosting.googleapis.com/v1beta1/projects/deeveecapital-site/sites/deeveecapital-site/customDomains/deeveecapital.com', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        console.log("\n📡 Google Cloud Domain Status:");
        console.log("  Host State:", data.hostState);
        console.log("  Ownership State:", data.ownershipState);
        console.log("  SSL Cert State:", data.cert?.state);
      }
    }
  } catch (e) {
    console.log("API check error:", e.message);
  }
}

check();
