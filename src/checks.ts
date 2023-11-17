import axios from "axios";

// Get cloudflare dns records
export async function getDnsRecords(zoneId: string): Promise<{}[]> {
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
// Check cloudflare token exists
export async function checkToken(): Promise<Boolean> {
    const options = {
        method: "GET",
        url: `https://api.cloudflare.com/client/v4/user/tokens/verify`,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TOKEN}`,
        },
    };
    try {
        const response = await axios.request(options);
        return response.status.toString().startsWith("2") ? true : false;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return error.response.status.toString().startsWith("4")
                ? false
                : true;
        } else {
            console.error("An unexpected error occurred:", error);
        }
    }
}
// Check cloudflare zone exists
export async function checkZone(): Promise<Boolean> {
    const options = {
        method: "GET",
        url: `https://api.cloudflare.com/client/v4/zones/${process.env.ZONE}`,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TOKEN}`,
        },
    };
    try {
        const response = await axios.request(options);
        return response.status.toString().startsWith("2") ? true : false;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return error.response.status.toString().startsWith("4")
                ? false
                : true;
        } else {
            console.error("An unexpected error occurred:", error);
        }
    }
}
// Check dns record exists
export async function checkRecord(): Promise<Boolean> {
    const options = {
        method: "GET",
        url: `https://api.cloudflare.com/client/v4/zones/${process.env.ZONE}/dns_records/${process.env.RECORD}`,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TOKEN}`,
        },
    };
    try {
        const response = await axios.request(options);
        return response.status.toString().startsWith("2") ? true : false;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return error.response.status.toString().startsWith("4")
                ? false
                : true;
        } else {
            console.error("An unexpected error occurred:", error);
        }
    }
}
