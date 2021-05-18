function Validator(formSelector){
    var _this=this;
    function getParent(element,selector){
        while(element.parentElement)
        {
            if(element.parentElement.matches(selector))
            {
                return element.parentElement;
            }
            element=element.parentElement;

        }
    }
    var formRules={};
    var validatorRules={
        required: function(value){
            return value? undefined : 'Vui lòng nhập trường này';
        },
        email: function(value){
            var regex=/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            return regex.test(value)? undefined : 'Vui lòng nhập email';
        },
        min: function(min){
            return function(value){
                return value.length>= min? undefined : `Vui lòng nhập tối thiểu ${min} ký tự `;
            }
            
        },
        max: function(max){
            return function(value){
                return value.length <= max? undefined : `Vui lòng nhập tối đa ${max} ký tự `;
            }
        },
        confirm: function(selector){
            return function(value){
                return value===document.querySelector(`${selector}`).value ? undefined : "Giá trị không trùng khớp";
            }
        }

    }

    //get form element trong Dom theo ''formElement' 
    var formElement= document.getElementById(formSelector);
    // chỉ xửa lý khi có element trong DOM
    if(formElement)
    {
        var inputs= formElement.querySelectorAll('input[name][rules]');
        for(var input of inputs)
        {
            
            var rules=input.getAttribute('rules').split('|');
            
            for (var  rule of rules){
                var isRuleHasValue= rule.includes(":");
                var ruleInfo;
                if(isRuleHasValue)
                {
                    var ruleInfo =rule.split(':')
                    rule=ruleInfo[0];
                }
                var ruleFunc= validatorRules[rule];
                if(isRuleHasValue)
                {
                    ruleFunc=ruleFunc(ruleInfo[1])
                }
                if(Array.isArray (formRules[input.name]))
                {
                    formRules[input.name].push(ruleFunc);
                }
                else{
                    formRules[input.name]=[ruleFunc];
                }
            }

            // lắng nghe sự kiện 

            input.onblur=hendeleValidate;
            input.oninput=hendeleClearError;
        }
        function hendeleValidate(event){
            var rules=formRules[event.target.name];
            var errorMessage;
            rules.some( function(rule){
                errorMessage= rule(event.target.value)
                return rule(event.target.value);
            }) 
            if(errorMessage){
                var formGroup= getParent(event.target,'.form-group')
                if(formGroup){
                    var formMessage= formGroup.querySelector('.form-message');
                    formMessage.innerHTML=errorMessage;
                    formGroup.classList.add('invalid')
                }
            }
            return !errorMessage;

        }
        function hendeleClearError(event){
            var formGroup= getParent(event.target,'.form-group')
            if(formGroup){
                var formMessage= formGroup.querySelector('.form-message');
                formMessage.innerHTML="";
                formGroup.classList.remove('invalid')
            }
        }
    }
    formElement.onsubmit = function(event){
        event.preventDefault();
        var inputs= formElement.querySelectorAll('input[name][rules]');
        var isValid= true;
        for(var input of inputs){
            if(!hendeleValidate({target: input})){
                isValid= false;
            }
        }
        if(isValid){
            if( typeof( _this.onSubmit)==='function'){
                var enableInput=formElement.querySelectorAll('[name]')
                var formValue=Array.from(enableInput).reduce((values,input)=>{
                    switch(input.type){
                        case 'radio':
                            values[input.name]=formElement.querySelectorAll('input[name="'+input.name+'"]');
                            break;
                        case 'checkbox':
                            if(!input.matches(":checked")){
                                values[input.name]=""  ;
                                return values;
                            }    
                            if(!Array.isArray(values[input.name])){
                                values[input.name]=[]
                            }
                            values[input.name].push(input.value);
                            break;
                        case "file":
                            values[input.name]=input.file;
                            break;
                        default:
                            values[input.name]=input.value;        
                    }
                    return values;
                },{});
                _this.onSubmit(formValue);
            }
            else{
                
                formElement.submit();
            }
        }
    }
}
