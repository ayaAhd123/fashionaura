import React from 'react';

const NotificationPanel = ({ notifications }) => {
    return (
        <div className="notification-panel">
            <h3>Notifications</h3>
            {notifications ? notifications.map(notif => (
                <div key={notif.id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                    <strong>{notif.title}</strong>
                    <p>{notif.message}</p>
                </div>
            )) : <p>Aucune nouvelle notification.</p>}
        </div>
    );
};

export default NotificationPanel;
