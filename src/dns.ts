// Imports
import axios from "axios";
import { config } from "dotenv";

// Load .env file
config();

// Main Function
async function dev() {
    const time = new Date().toLocaleTimeString();
    console.log(`\n----------\nRunning at ${time}`);
    const zones = await getZones();
    zones.forEach(async (zone: any) => {
        const dnsRecords = await getDnsRecords(zone.id);
        console.log(`\n----------\nZone: ${zone.name}`);
        console.log(`Zone ID: ${zone.id}`);
        console.log(`----------`);
        dnsRecords.forEach(async (dnsRecord: any) => {
            console.log(`DNS Record: ${dnsRecord.name}`);
            console.log(`DNS Record ID: ${dnsRecord.id}`);
            console.log(`DNS Record Type: ${dnsRecord.type}`);
            console.log(`DNS Record Content: ${dnsRecord.content}`);
            console.log(`----------`);
        });
    });
}

// Get cloudflare zones
async function getZones(): Promise<{}[]> {
    const options = {
        method: "GET",
        url: `https://api.cloudflare.com/client/v4/zones`,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TOKEN}`,
        },
    };
    const { data } = await axios.request(options);
    return data.result;
}

// Get cloudflare dns records
async function getDnsRecords(zoneId: string): Promise<{}[]> {
    const options = {
        method: "GET",
        url: `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TOKEN}`,
        },
    };
    const { data } = await axios.request(options);
    return data.result;
}

export { dev };
