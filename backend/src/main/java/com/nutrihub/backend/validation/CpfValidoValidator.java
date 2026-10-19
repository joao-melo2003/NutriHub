
package com.nutrihub.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class CpfValidoValidator implements ConstraintValidator<CpfValido, String> {

    @Override
    public boolean isValid(String cpf,ConstraintValidatorContext context) {

        if (cpf == null || cpf.isBlank()) return true;
        

        return CpfValidator.validar(cpf);
    }
}
