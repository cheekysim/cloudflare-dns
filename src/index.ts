// Imports
import axios from "axios";
import nodeCron from "node-cron";
import { dev } from "./dns.js";
import { config } from "dotenv";

// Interfaces
interface DnsRecord {
    id: string;
    zone_id: string;
    zone_name: string;
    type: string;
    name: string;
    content: string;
    proxiable: boolean;
    proxied: boolean;
    ttl: number;
    locked: boolean;
    meta: {
        auto_added: boolean;
        managed_by_apps: boolean;
        managed_by_argo_tunnel: boolean;
    };
    comment: string;
    tags: [];
    created_on: string;
    modified_on: string;
}

interface updateOptions {
    content: string;
    name: string;
    proxied: boolean;
    type: string;
}

// Load .env file
config();

// Call Main Function
if (process.env.NODE_ENV === "dev") {
    dev();
} else {
    if (!process.env.TOKEN) {
        throw new Error("TOKEN is not set.");
    }
    if (!process.env.ZONE) {
        throw new Error("ZONE is not set.");
    }
    if (!process.env.RECORD) {
        throw new Error("RECORD is not set.");
    }
    nodeCron.schedule("0 * * * *", main);
}
// Main Function
async function main() {
    const time = new Date().toLocaleTimeString();
    console.log(`\n----------\nRunning at ${time}`);
    const publicIp = await getPublicIp();
    const cloudflareDnsIp = await getCloudflareDnsIp();
    const dnsRecord = await getDnsRecord(process.env.ZONE, process.env.RECORD);
    console.log(`Public IP: ${publicIp}`);
    console.log(`Cloudflare DNS IP: ${cloudflareDnsIp}`);
    if (publicIp === cloudflareDnsIp) {
        console.log("Public IP and Cloudflare DNS IP are the same.");
    } else {
        console.log("Public IP and Cloudflare DNS IP are different.");
        const data = {
            content: publicIp,
            name: dnsRecord.name,
            proxied: dnsRecord.proxied,
            type: dnsRecord.type,
        };
        const updatedCloudflareDnsIp = await updateCloudflareDnsIp(data);
        console.log(`Cloudflare DNS IP updated to: ${updatedCloudflareDnsIp}`);
    }
}

// Fetch public ip
async function getPublicIp(): Promise<string> {
    const { data } = await axios.get("https://api.ipify.org?format=json");
    return data.ip;
}

// Get cloudflare dns ip
async function getCloudflareDnsIp(): Promise<string> {
    const options = {
        method: "GET",
        url: `https://api.cloudflare.com/client/v4/zones/${process.env.ZONE}/dns_records/${process.env.RECORD}`,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TOKEN}`,
        },
    };
    const { data } = await axios.request(options);
    return data.result.content;
}

// Update cloudflare dns ip
async function updateCloudflareDnsIp(Options: updateOptions): Promise<string> {
    const options = {
        method: "PUT",
        url: `https://api.cloudflare.com/client/v4/zones/${process.env.ZONE}/dns_records/${process.env.RECORD}`,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TOKEN}`,
        },
        data: Options,
    };
    const { data } = await axios.request(options);
    return data.result.content;
}

// Get cloudflare dns records
async function getDnsRecord(
    zoneId: string,
    recordId: string
): Promise<DnsRecord> {
    const options = {
        method: "GET",
        url: `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TOKEN}`,
        },
    };
    const { data } = await axios.request(options);
    return data.result;
}
