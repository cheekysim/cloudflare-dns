// Imports
import axios from "axios";
import nodeCron from "node-cron";
import { config } from "dotenv";

// Load .env file
config();

// Call Main Function
nodeCron.schedule("0 * * * *", main);

// Main Function
async function main() {
    const time = new Date().toLocaleTimeString();
    console.log(`\n----------\nRunning at ${time}`);
    const publicIp = await getPublicIp();
    const cloudflareDnsIp = await getCloudflareDnsIp();
    console.log(`Public IP: ${publicIp}`);
    console.log(`Cloudflare DNS IP: ${cloudflareDnsIp}`);
    if (publicIp === cloudflareDnsIp) {
        console.log("Public IP and Cloudflare DNS IP are the same.");
    } else {
        console.log("Public IP and Cloudflare DNS IP are different.");
        const updatedCloudflareDnsIp = await updateCloudflareDnsIp();
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
        url: `https://api.cloudflare.com/client/v4/zones/${process.env.ZONE}/dns_records/${process.env.DNS}`,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TOKEN}`,
        },
    };
    const { data } = await axios.request(options);
    return data.result.content;
}

// Update cloudflare dns ip
async function updateCloudflareDnsIp(): Promise<string> {
    const options = {
        method: "PUT",
        url: `https://api.cloudflare.com/client/v4/zones/${process.env.ZONE}/dns_records/${process.env.DNS}`,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TOKEN}`,
        },
        data: {
            content: "86.165.143.187",
            name: "cheekysim.com",
            proxied: true,
            type: "A",
            comment: "Dynamic DNS",
        },
    };
    const { data } = await axios.request(options);
    return data.result.content;
}
