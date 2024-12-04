const redisKeys = {
    societyRolePermissions: 'societyRolePermissions.{{societyId}}.{{role}}',
}

export const redisDeletePattern = {
    societyRolePermissions: 'societyRolePermissions.{{societyId}}.*',
}

export default redisKeys;