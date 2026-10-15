export  type SearchApiParams = {
    page: number;
    per_page: number;
    search?: string;
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
};