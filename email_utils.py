import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_verification_email(to_email: str, username: str, token: str):
    smtp_server = ""
    smtp_port = 587
    smtp_user = ""
    smtp_password = ""

    subject = "BiTest Email Doğrulama"
    verification_link = f"http://localhost:8000/verify-email?token={token}"
    body = f"""
    Merhaba {username},

    BiTest hesabını doğrulamak için aşağıdaki linke tıkla:
    {verification_link}

    Eğer bu işlemi sen yapmadıysan bu maili dikkate alma.
    """
    msg = MIMEMultipart()
    msg["From"] = smtp_user
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, to_email, msg.as_string())
        return True
    except Exception as e:
        print("Email gönderilemedi:", e)
        return False 