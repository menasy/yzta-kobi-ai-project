# Notification ORM -> response schema donusumleri.

from app.models.notification import Notification
from app.schemas.notification import (
    NotificationListItem,
    NotificationMarkReadResponse,
    NotificationResponse,
)


def to_notification_response(notification: Notification) -> NotificationResponse:
    return NotificationResponse.model_validate(notification)


def to_notification_list_item(notification: Notification) -> NotificationListItem:
    return NotificationListItem.model_validate(notification)


def to_notification_list_items(notifications: list[Notification]) -> list[NotificationListItem]:
    return [to_notification_list_item(item) for item in notifications]


def to_notification_mark_read_response(notification: Notification) -> NotificationMarkReadResponse:
    return NotificationMarkReadResponse.model_validate(notification)
