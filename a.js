function Validator(options) {
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement
    }
  }
  const selectorRules = {};

  // Hàm thực hiện validate
  function validate(inputElement, rule) {
    const errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errSelector);
    let errorMessage;

    //Lấy ra các rules của selector
    const rules = selectorRules[rule.selector];

    //Lặp qua từng rules & check
    //Nếu có lỗi thì dừng việc kiểm tra
    for (let i = 0; i < rules.length; i++) {
      switch (inputElement.type) {
        case 'radio':
        case 'checkbox':
          errorMessage = rules[i](inputElement.value);
          break;
        default:
          errorMessage = rules[i](inputElement.value);
          break;
      }
      if (errorMessage) break;
    }
    if (errorMessage) {
      errorElement.innerText = errorMessage;
      getParent(inputElement, options.formGroupSelector).classList.add('invalid')
    } else {
      errorElement.innerText = '';
      getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
    }
    return !errorMessage
  }

  //Lấy element của form cần validate
  const formElement = document.querySelector(options.form)
  if (formElement) {

    //Khi submit form
    formElement.onsubmit = function (e) {
      e.preventDefault();
      let isformValid = true;

      //Lặp qua từng rules và validate

      options.rules.forEach(function (rule) {
        const inputElement = formElement.querySelector(rule.selector)
        const isvalid = validate(inputElement, rule);
        if (!isvalid) {
          isformValid = false
        }
      })
      
      //Trường hợp submit vs JS
      if (isformValid) {
        if (typeof options.onSubmit === 'function') {
          const enableInput = formElement.querySelectorAll('[name]')
          const formValues = Array.from(enableInput).reduce(function (value, input) {
            value[input.name] = input.value
            return value;
          }, {})
          options.onSubmit(formValues);
        }
        // Trường hợp submit với hành vi mặc định

        else {
          formElement.submit();
        }
      }
    }
    //Lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, oninput, ...)
    options.rules.forEach(function (rule) {

      //Lưu lại các rules cho mỗi input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test)
      } else {
        selectorRules[rule.selector] = [rule.test]
      }
      const inputElement = formElement.querySelector(rule.selector)

      if (inputElement) {

        //Xử lý trường hợp blur khỏi input
        inputElement.onblur = function () {
          validate(inputElement, rule);
        }

        //Xử lý trường hợp khi người dùng nhập
        inputElement.oninput = function () {
          const errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errSelector);
          errorElement.innerText = '';
          getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }
      }
    })
  }
}





//Định nghĩa rules
/*Nguyên tắc của các rules
1.Có lỗi -> message lỗi
2.kh có lỗi -> undefined
*/
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.trim() ? undefined : message || 'Vui lòng nhập trường này!';
    }
  }
}
Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : message || 'Trường này phải là email';
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
      return value === getConfirmValue() ? undefined : message || `Giá trị nhập vào không chính xác`;
    }
  }
}