/** Mirrors `AppVisitor` in the backend's `modules/app-visitor/app-visitor.service.ts`. */
export interface AppVisitor {
  shop: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  accountOwner: boolean | null;
  collaborator: boolean | null;
  firstSeenAt: string;
  lastSeenAt: string;
  visitCount: number;
}

export interface AppVisitorList {
  /** Server start or last clear — nothing before it is known. */
  since: string;
  visitors: AppVisitor[];
}

export interface AppVisitorClearResult {
  cleared: number;
}
