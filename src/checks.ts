import axios from "axios";

interface ErrorTemplate {
    recordId: string;
    errorPresent: boolean;
}

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
// Check DNS records exist
export async function checkRecords(records?: Array<string>): Promise<Boolean> {
    if (!records && !process.env.RECORDS)
        throw new TypeError("A valid record must be provided");
    if (!records && process.env.RECORDS)
        records = [...process.env.RECORDS.split(",")];

    let errors: Array<ErrorTemplate> = [];

    for await (let record of records) {
        const options = {
            method: "GET",
            url: `https://api.cloudflare.com/client/v4/zones/${process.env.ZONE}/dns_records/${record.trim()}`,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.TOKEN}`,
            },
        };
        try {
            const response = await axios.request(options);
            let error = !response.status.toString().startsWith("2");
            if (error)
                errors.push({ errorPresent: true, recordId: record.trim() });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response.status.toString().startsWith("4"))
                    errors.push({ errorPresent: true, recordId: record.trim() });
            } else {
                console.error("An unexpected error occurred:", error);
            }
        }
    }
    if (errors.length > 0) {
        console.log("The following records have failed:")
        console.log(errors.map(x => x.recordId).join(", "));
        return false;
    }
    return true;
}