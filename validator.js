function Validator(options) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }
    const selectorRules = {};
    function validate(inputElement, rule) {
        const errElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errSelector)
        let errMessage;
        const rules = selectorRules[rule.selector]
        for (let i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errMessage = rules[i](formElement.querySelector(rule.selector + ':checked'))
                    break;

                default:
                    errMessage = rules[i](inputElement.value)

            }
            if (errMessage) {
                break;
            }

        }
        if (errMessage) {
            errElement.innerText = errMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        } else {
            errElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }
        return !errMessage;
    }
    const formElement = document.querySelector(options.form)
    if (formElement) {
        formElement.onsubmit = function (e) {
            e.preventDefault();
            let isFormValid = true;
            options.rules.forEach(function (rule) {
                const inputElement = formElement.querySelector(rule.selector)
                const isvalid = validate(inputElement, rule)
                if (!isvalid) {
                    isFormValid = false;
                }
            })
            if (isFormValid) {
                if (typeof options.onSubmit === 'function') {
                    const enableInput = formElement.querySelectorAll('[name]')
                    const formValues = Array.from(enableInput).reduce(function (values, input) {
                        switch (input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if ((!input.matches(':checked'))) {
                                    values[input.name] = '';
                                    return values;
                                }
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value);
                                break;
                            case 'file':
                                values[input.name] = input.files
                                break;
                            default:
                                values[input.name] = input.value
                        }
                        return values;
                    }, {})
                    options.onSubmit(formValues);
                }

            }
        }
        options.rules.forEach(function (rule) {
            const inputElement = formElement.querySelectorAll(rule.selector)
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }
            if (inputElement) {

                inputElement.onblur = function () {
                    validate(inputElement, rule)
                }

                inputElement.oninput = function () {
                    const errElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errSelector)
                    errElement.innerText = '';
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                }
            }
        })

    }
}
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || 'Vui lòng nhập trường này';
        }
    }
}
Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Trường này phải là email'
        }
    }
}
Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập ${min} số`
        }
    }
}
Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập lại không chính xác'
        }
    }
}