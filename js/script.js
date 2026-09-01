document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('introduction-contact-form');
    var submitButton = document.getElementById('intro-submit-button');
    var formFeedback = document.getElementById('introduction-form-feedback');

    if (!form || !submitButton || !formFeedback) {
        return;
    }

    function getField(fieldName) {
        return form.querySelector('[name="' + fieldName + '"]');
    }

    function setError(field, message) {
        if (!field) {
            return;
        }
        var wrapper = field.closest('.introduction-field');
        var errorElement = wrapper ? wrapper.querySelector('.field-error') : null;
        field.classList.remove('input-valid');
        field.classList.add('input-invalid');
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    function setValid(field) {
        if (!field) {
            return;
        }
        var wrapper = field.closest('.introduction-field');
        var errorElement = wrapper ? wrapper.querySelector('.field-error') : null;
        field.classList.remove('input-invalid');
        field.classList.add('input-valid');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    function resetField(field) {
        if (!field) {
            return;
        }
        var wrapper = field.closest('.introduction-field');
        var errorElement = wrapper ? wrapper.querySelector('.field-error') : null;
        field.classList.remove('input-invalid');
        field.classList.remove('input-valid');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    function formatContact(value) {
        var digits = value.replace(/[^0-9]/g, '');
        if (/^91[6-9][0-9]{9}$/.test(digits)) {
            return digits;
        }
        if (/^[6-9][0-9]{9}$/.test(digits)) {
            return digits;
        }
        return '';
    }

    function validateEmail(value) {
        var email = value.trim();
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validateName(value) {
        var text = value.trim();
        if (text.length < 2) {
            return false;
        }
        if (/^[0-9\s]+$/.test(text)) {
            return false;
        }
        return true;
    }

    function validateMessage(value) {
        var text = value.trim();
        return text.length >= 10;
    }

    function clearFormFeedback() {
        formFeedback.textContent = '';
        formFeedback.className = 'intro-form-feedback';
    }

    function clearAllFieldStates() {
        ['name', 'email', 'contact', 'message'].forEach(function (fieldName) {
            resetField(getField(fieldName));
        });
    }

    function getFormValues() {
        return {
            name: form.querySelector('[name="name"]').value.trim(),
            email: form.querySelector('[name="email"]').value.trim(),
            contact: form.querySelector('[name="contact"]').value.trim(),
            message: form.querySelector('[name="message"]').value.trim()
        };
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        clearFormFeedback();
        clearAllFieldStates();

        var values = getFormValues();
        var isValid = true;

        if (!validateName(values.name)) {
            setError(getField('name'), 'Please enter a valid name.');
            isValid = false;
        } else {
            setValid(getField('name'));
        }

        if (!validateEmail(values.email)) {
            setError(getField('email'), 'Please enter a valid email address.');
            isValid = false;
        } else {
            setValid(getField('email'));
        }

        if (!formatContact(values.contact)) {
            setError(getField('contact'), 'Please enter a valid contact number.');
            isValid = false;
        } else {
            setValid(getField('contact'));
        }

        if (!validateMessage(values.message)) {
            setError(getField('message'), 'Please enter a message with at least 10 characters.');
            isValid = false;
        } else {
            setValid(getField('message'));
        }

        if (!isValid) {
            formFeedback.textContent = 'Please review the highlighted fields and try again.';
            formFeedback.classList.add('intro-form-feedback--error');
            return;
        }

        submitButton.disabled = true;
        var originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Sending...';

        var formData = new FormData();
        formData.append('name', values.name);
        formData.append('email', values.email);
        formData.append('contact', values.contact);
        formData.append('message', values.message);

        fetch('backend/send-mail.php', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                if (data && data.success) {
                    form.reset();
                    clearAllFieldStates();
                    formFeedback.textContent = 'Thank you! Your inquiry has been submitted successfully. We\'ll get back to you shortly.';
                    formFeedback.classList.add('intro-form-feedback--success');
                } else {
                    formFeedback.textContent = data && data.message ? data.message : 'Something went wrong while sending your inquiry. Please try again or contact us directly.';
                    formFeedback.classList.add('intro-form-feedback--error');
                }
            })
            .catch(function () {
                formFeedback.textContent = 'Something went wrong while sending your inquiry. Please try again or contact us directly.';
                formFeedback.classList.add('intro-form-feedback--error');
            })
            .finally(function () {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            });
    });
});
