// Imports
import nodeCron from "node-cron";
import { config } from "dotenv";
import { main } from "./main.js";
import {
    checkToken,
    checkZone,
    checkRecords,
    getDnsRecords,
} from "./checks.js";

// Interfaces
export interface DnsRecord {
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

export interface updateOptions {
    content: string;
    name: string;
    proxied: boolean;
    type: string;
}

// Load .env file
config();
setup();

// Start Script
async function setup() {
    if (!process.env.TOKEN || (await checkToken()) === false) {
        throw new Error(
            "Token is not set or is wrong.\nPlease generate one | https://dash.cloudflare.com/profile/api-tokens |"
        );
    } else if (!process.env.ZONE || (await checkZone()) === false) {
        throw new Error(
            "Zone is not set or is wrong.\nZone can be found in the API Section of the Domains' Overview Page"
        );
    } else if (!process.env.RECORDS || (await checkRecords()) === false) {
        console.log(
            "Record is not set or is wrong.\nHere are all current A records: "
        );
        const records = (await getDnsRecords(process.env.ZONE))
            .map((record: DnsRecord) => {
                return {
                    id: record.id,
                    name: record.name,
                    type: record.type,
                    content: record.content,
                };
            })
            .filter((record: DnsRecord) => record.type === "A");
        console.log(records);
        console.log("Please set RECORD env to the correct Record ID");
    } else {
        main();
        nodeCron.schedule(process.env.CRON_SCHEDULE || "0 * * * *", main);
    }
}
