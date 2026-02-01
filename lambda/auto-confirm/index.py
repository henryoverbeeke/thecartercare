import json

def lambda_handler(event, context):
    """
    Auto-confirm Cognito user signups.
    This Lambda is triggered by Cognito pre-signup trigger.
    """
    # Auto-confirm the user
    event['response']['autoConfirmUser'] = True

    # Auto-verify the email
    if 'email' in event['request']['userAttributes']:
        event['response']['autoVerifyEmail'] = True

    # Auto-verify the phone if provided
    if 'phone_number' in event['request']['userAttributes']:
        event['response']['autoVerifyPhone'] = True

    print(f"Auto-confirmed user: {event['userName']}")

    return event
