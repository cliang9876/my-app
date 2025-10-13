export interface User {
  id: number;
  name: string;
  email?: string;
}

import React from "react";

export interface Column<T = any> {
  // id can be a key of the row object or a custom string (e.g. 'action')
  id: keyof T | string;
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: number) => string;
  // optional render function for custom cells (useful for action buttons)
  render?: (row: T) => React.ReactNode;
}
