
package com.nutrihub.backend.validation;

public class CpfValidator {

    public static boolean validar(String cpf) {
        
        if (cpf == null) {
            return false;
        }
    
        cpf = cpf.replaceAll("\\D", "");

        if (cpf.length() != 11) {
            return false;
        }

        if (cpf.matches("(\\d)\\1{10}")) {
            return false;
        }

        int primeiroDigito = calcularDigito(cpf, 9);
        int segundoDigito = calcularDigito(cpf, 10);

        return primeiroDigito == Character.getNumericValue(cpf.charAt(9))
            && segundoDigito == Character.getNumericValue(cpf.charAt(10));
    }

    private static int calcularDigito(String cpf, int tamanho) {
        int soma = 0;

        for (int i = 0; i < tamanho; i++) {
            int digito = Character.getNumericValue(cpf.charAt(i));
            soma += digito * (tamanho + 1 - i);
        }

        int resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }
}
