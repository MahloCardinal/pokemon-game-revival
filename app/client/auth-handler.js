import { registerAction } from "./action-registry.js";

import { openConfirm } from "./dialog-handler.js";
import { setAuthMode, submitAccountDeletion, submitLogin, submitLogout, submitPasswordRecovery, submitRecoveredPassword, submitRegistration } from "./session.js";
import { root } from "./game-state.js";
import { messageDescriptor } from "./i18n.js";

function formFieldValue(form, fieldName) {
    var field = form && form.querySelector('[data-field="' + fieldName + '"]');
    return field ? field.value : "";
}

registerAction("auth-mode-login", function() {
    setAuthMode("login");
    return;

});

registerAction("auth-mode-register", function() {
    setAuthMode("register");
    return;

});

registerAction("auth-mode-recover", function() {
    setAuthMode("recover");
    return;

});

registerAction("auth-login", function(element) {
    var form = element && element.matches && element.matches("form") ? element : root.querySelector('[data-auth-form="login"]');
    var loginValues = {
      username: formFieldValue(form, "auth-username"),
      password: formFieldValue(form, "auth-password")
    };
    submitLogin(loginValues.username, loginValues.password);
    return;

});

registerAction("auth-register", function(element) {
    var form = element && element.matches && element.matches("form") ? element : root.querySelector('[data-auth-form="register"]');
    var registerValues = {
      username: formFieldValue(form, "auth-username"),
      password: formFieldValue(form, "auth-password"),
      email: formFieldValue(form, "auth-email")
    };
    submitRegistration(registerValues.username, registerValues.password, registerValues.email);
    return;

});

registerAction("auth-recover", function(element) {
    var form = element && element.matches && element.matches("form") ? element : root.querySelector('[data-auth-form="recover"]');
    submitPasswordRecovery(formFieldValue(form, "auth-username"), formFieldValue(form, "auth-email"));
    return;

});

registerAction("auth-reset-password", function(element) {
    var form = element && element.matches && element.matches("form") ? element : root.querySelector('[data-auth-form="reset-password"]');
    submitRecoveredPassword(formFieldValue(form, "auth-new-password"));
    return;

});

registerAction("auth-logout", function(element) {
    submitLogout();
    return;

});

registerAction("auth-delete-account", function(element) {
    openConfirm(
      messageDescriptor("auth.deleteTitle"),
      [
        messageDescriptor("auth.deleteConfirm"),
        messageDescriptor("auth.deleteIrreversible")
      ],
      function () {
        submitAccountDeletion();
      },
      { confirmLabel: messageDescriptor("auth.deleteTitle") }
    );
    return;

});
