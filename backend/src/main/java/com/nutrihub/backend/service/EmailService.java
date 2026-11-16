package com.nutrihub.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import com.nutrihub.backend.entity.Usuario;

import java.util.Locale;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public EmailService(
            JavaMailSender mailSender,
            SpringTemplateEngine templateEngine
    ) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    public void enviarEmailVerificacao(Usuario usuario, String token) {

        String link = frontendUrl.replaceAll("/$", "")
                + "/login/confirm-email?token=" + token;

        Context context = new Context(new Locale("pt", "BR"));

        context.setVariable("nome", usuario.getNome());
        context.setVariable("link", link);

        enviar(
                usuario.getEmail(),
                "Confirme seu e-mail | NutriHub",
                "email/confirmacao-email",
                context
        );
    }

    public void enviarEmailRecuperacaoSenha(Usuario usuario,String token) {

        String link = frontendUrl.replaceAll("/$", "")
                + "/esqueci-senha/reset-senha?token=" + token;

        Context context = new Context(new Locale("pt", "BR"));

        context.setVariable("nome", usuario.getNome());
        context.setVariable("link", link);

        enviar(
                usuario.getEmail(),
                "Recuperação de senha | NutriHub",
                "email/recuperacao-senha",
                context
        );
    }

    private void enviar(String destinatario,String assunto,String template,Context context) {

        String html = templateEngine.process(template, context);

        try {

            MimeMessage mensagem = mailSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(
                    mensagem,
                    false,
                    "UTF-8"
            );

            helper.setTo(destinatario);
            helper.setFrom("noreply@nutrihub.com");
            helper.setSubject(assunto);
            helper.setText(html, true);

            mailSender.send(mensagem);

        } catch (MessagingException e) {

            throw new IllegalStateException(
                    "Erro ao montar o e-mail", e
            );
        }
    }
}