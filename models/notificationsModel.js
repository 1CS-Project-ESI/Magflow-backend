import { DataTypes } from 'sequelize';
import { sequelize , User} from './usersModel.js';

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    message: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'notifications',
    timestamps: false
});

const NotificationSent = sequelize.define('NotificationSent', {
    id_notification: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Notification,
            key: 'id'
        },
        allowNull: false,
    },
    id_user: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: User,
            key: 'id'
        },
        allowNull: false,
    }
}, {
    tableName: 'notificationsent',
    timestamps: false
});

export { Notification, NotificationSent };
