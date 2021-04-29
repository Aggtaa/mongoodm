/* eslint-disable i18next/no-literal-string */
export default {
    user: [
        {
            id: '56d9bf92f9be48771d6fe5b1',
            email: 'test@optimacros.com',
            firstName: 'UsernamePassword',
            lastName: 'Test',
            roles: [
                'user',
                'admin',
            ],
            workspaces: [
                '14eb9c306da3a7022650e4c6',
            ],
            created: new Date('1990-01-01T00:00:01Z'),
            createdBy: 'migration',
        },
        {
            id: '342e22433ab88c18dbe8e428',
            email: 'test2f_telegram@optimacros.com',
            firstName: '2F',
            lastName: 'Test',
            roles: [
                'user',
            ],
            secondAuthDriver: 'telegramConfirmation',
            telegramId: 111111111,
            created: new Date('1990-01-01T00:00:01Z'),
            createdBy: 'migration',
        },
        {
            id: 'd168a02b62a8bcfa28cadd2c',
            email: 'test2f_email@optimacros.com',
            firstName: '2F',
            lastName: 'Test',
            roles: [
                'user',
            ],
            secondAuthDriver: 'emailConfirmation',
            telegramId: 111111111,
            created: new Date('1990-01-01T00:00:01Z'),
            createdBy: 'migration',
        },
    ],
    authentication: [
        {
            id: '2efda9453b32c0b645fad2c3',
            userId: '56d9bf92f9be48771d6fe5b1',
            driver: 'usernamePassword',
            username: 'test@optimacros.com',
            passwordHash: '$2y$13$AFb2SroUePosIiulrzjK/exu2f/LKMYL65Jc5/VISkKI9WbOiqW2O',
        },
        {
            id: '78cc0f8840769cf699a4d5cb',
            userId: '342e22433ab88c18dbe8e428',
            driver: 'usernamePassword',
            username: 'test2f_telegram@optimacros.com',
            passwordHash: '$2y$13$AFb2SroUePosIiulrzjK/exu2f/LKMYL65Jc5/VISkKI9WbOiqW2O',
        },
        {
            id: '5cadf3c28dfffe7ac162df74',
            userId: '342e22433ab88c18dbe8e428',
            driver: 'telegramConfirmation',
        },
        {
            id: 'fcb0ffc5bf25ad206b42ae9c',
            userId: 'd168a02b62a8bcfa28cadd2c',
            driver: 'usernamePassword',
            username: 'test2f_email@optimacros.com',
            passwordHash: '$2y$13$AFb2SroUePosIiulrzjK/exu2f/LKMYL65Jc5/VISkKI9WbOiqW2O',
        },
        {
            id: 'd3fbfadee0672a5efbf66af6',
            userId: 'd168a02b62a8bcfa28cadd2c',
            driver: 'emailConfirmation',
        },
    ],
    workspace: [
        {
            id: '14eb9c306da3a7022650e4c6',
            name: 'test0',
            domains: [
                'test.optimacros.com',
            ],
            authenticationRedirectUrl: 'https://test1.optimacros.com/auth?token={userToken}',
            approved: new Date('1990-01-01T00:00:01Z'),
            approvedBy: '56d9bf92f9be48771d6fe5b1',
        },
    ],
};
