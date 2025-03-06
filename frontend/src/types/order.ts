// src/types/order.ts
// import { useState } from 'react';

export interface Order {
  id: string;
  name: string | null;
  surname: string | null;
  email: string | null;
  phone: string | null;
  age: number | null;
  course: string | null;
  course_format: string;
  course_type: string;
  status: string;
  sum: number | null;
  alreadyPaid: number | null;
  groupEntity: { id: string; name: string } | null;
  created_at: string;
}

export interface OrderWithGroupId extends Order {
  groupId?: string;
}

