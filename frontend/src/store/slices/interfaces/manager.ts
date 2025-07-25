export interface Manager {
  role?: string;
  id: string;
  email: string;
  name: string;
  surname: string;
  is_active: boolean;
  hasPassword: boolean;
  last_login: string;
  statistics?: {
    totalOrders: number;
    activeOrders: number;
  };
}

export interface ManagerState {
  managers: Manager[];
  total: number;
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  overallStats: {
    Total: number;
    New: number;
    NULL: number;
    'In work': number;
    Agree: number;
    Disagree: number;
    Dubbing: number;
  };
}
export interface FetchManagersParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export interface CreateManagerParams {
  email: string;
  name: string;
  surname: string;
}


