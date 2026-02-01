import axios from "axios";
import { updateOptions, DnsRecord } from "./index.js";
import fs from "fs";

// Main Function
export async function main() {
    // Check for HASSIO config.json
    const hassioConfigPath = "/options.json";

    if (fs.existsSync(hassioConfigPath)) {
        const rawData = fs.readFileSync(hassioConfigPath, "utf-8");
        const config = JSON.parse(rawData);

        process.env.TOKEN = config.token;
        process.env.ZONE = config.zone;
        process.env.RECORDS = config.records;
    }

    if (!process.env.TOKEN || !process.env.ZONE || !process.env.RECORDS) {
        console.error(
            "Error: TOKEN, ZONE, and RECORDS environment variables must be set."
        );
        return;
    }
    const time = new Date().toLocaleTimeString();
    console.log(`\n----------\nRunning at ${time}`);
    const publicIp = await getPublicIp();

    (process.env.RECORDS).split(",").forEach(async (record) => {
        record = record.trim();

        const cloudflareDnsIp = await getCloudflareDnsIp(record);
        const dnsRecord = await getDnsRecord(process.env.ZONE, record);
        console.log(`Public IP: ${publicIp}`);
        console.log(`Cloudflare DNS IP: ${cloudflareDnsIp}`);
        if (publicIp === cloudflareDnsIp) {
            console.log("Public IP and Cloudflare DNS IP are the same.");
        } else {
            console.log("Public IP and Cloudflare DNS IP are different.");
            const data = {
                ...dnsRecord,
                content: publicIp
            };
            const updatedCloudflareDnsIp = await updateCloudflareDnsIp(record, data);
            console.log(`Cloudflare DNS IP updated to: ${updatedCloudflareDnsIp}`);
        }
    });
}
// Fetch public ip

async function getPublicIp(): Promise<string> {
    const { data } = await axios.get("https://api.ipify.org?format=json");
    return data.ip;
}
// Get cloudflare dns ip

async function getCloudflareDnsIp(recordId: string): Promise<string> {
    const options = {
        method: "GET",
        url: `https://api.cloudflare.com/client/v4/zones/${process.env.ZONE}/dns_records/${recordId}`,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TOKEN}`,
        },
    };
    const { data } = await axios.request(options);
    return data.result.content;
}
// Update cloudflare dns ip

async function updateCloudflareDnsIp(recordId: string, DNSOptions: updateOptions): Promise<string> {
    const options = {
        method: "PUT",
        url: `https://api.cloudflare.com/client/v4/zones/${process.env.ZONE}/dns_records/${recordId}`,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TOKEN}`,
        },
        data: DNSOptions,
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
