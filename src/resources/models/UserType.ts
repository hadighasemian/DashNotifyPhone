export interface UserType {
    id: number;
    name: string;
    mobile: string;
    national_code: string;
    assurance?: string;
    chart?: string;
    job_number: string;
    avatar?: string;
    thread?: {
        threadId: string;
        id: string;
    };
    role?: {
        name: string;
    };
}