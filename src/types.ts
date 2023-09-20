export type OSType = "All" | "Win32" | "WinCE x86" | "WinCE ALL";

export interface TOC {
    TOC: Update[];
}

export interface Update {
    VERSIONID: string;
    VERSIONTEXT: string;
    MINLIC: string;
    MINVERID: string;
    DATE: string;
    RELEASENOTES: any;
    FILE: any;
}