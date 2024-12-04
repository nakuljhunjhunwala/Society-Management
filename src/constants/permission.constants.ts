interface IPermission {
    permission_id: number;
    name: string;
    code: string;
    category: string;
    description: string;
    plans: any[];
}

const defaultPermissions = [
    {
        permission_id: 1,
        name: "Add Maintenance",
        code: "add_maintenance",
        category: "Maintenance",
        description: "Ability to create new maintenance requests",
        plans: []
    },
    {
        permission_id: 2,
        name: "View Maintenance",
        code: "view_maintenance",
        category: "Maintenance",
        description: "Ability to view maintenance requests",
        plans: []
    }
] as const;

type PermissionCodes = typeof defaultPermissions[number]["code"];

const permissions: IPermission[] = defaultPermissions as unknown as IPermission[];;

export {
    permissions as defaultPermissions, PermissionCodes
};