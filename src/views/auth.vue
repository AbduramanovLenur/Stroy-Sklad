<template>
    <section class="auth">
        <div class="container">
            <div class="auth__inner">
                <div class="auth__wrapper">
                    <div class="auth__logo">
                        <img 
                            src="@/assets/images/auth/logo-auth.svg" 
                            alt="logo" 
                            width="415" 
                            height="80" 
                            loading="lazy"
                        >
                    </div>
                    <h2 class="auth__title">
                        {{ $t("login") }}
                    </h2>
                    <form class="auth__form" @submit.prevent="authHandler">
                        <label class="auth__label">
                            {{ $t("loginLabel") }}
                            <input 
                                class="auth__input" 
                                type="text" 
                                v-model="formData.userName"
                                :placeholder="$t('loginPlaceholder')"
                            >
                            <span 
                                v-if="v$?.userName?.$error" 
                                class="error-white"
                            >
                                {{ v$?.userName?.$errors[0]?.$message }}
                            </span>
                        </label>
                        <label class="auth__label">
                            {{ $t("passwordLabel") }}
                            <span class="auth__label-wrapper">
                                <input 
                                    class="auth__input" 
                                    :type="isShow ? 'text' : 'password'" 
                                    v-model="formData.password"
                                    :placeholder="$t('passwordPlaceholder')"
                                >
                                <span class="auth__label-icon" @click="() => isShow = !isShow">
                                    <Icon name="eye" />
                                </span>
                            </span>
                            <span 
                                v-if="v$?.password?.$error" 
                                class="error-white"
                            >
                                {{ v$?.password?.$errors[0]?.$message }}
                            </span>
                        </label>
                        <button class="auth__submit" type="submit">
                            {{ $t("loginButton") }}
                        </button>
                    </form>
                    <SwitcherLang />
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, computed } from "vue";
import { useVuelidate } from "@vuelidate/core";
import { required, minLength } from "@/utils/i18n-validators.js";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { clearForm } from "@/utils/secondary-functions.js";

import { useMutation } from "@tanstack/vue-query";
import { loginUser } from "@/services/auth.services.js";

const router = useRouter();
const toast = useToast();
const { t } = useI18n();

const isShow = ref(false);

const formData = ref({
    userName: "",
    password: ""
})

const rules = computed(() => ({
    userName: { required },
    password: { required, minLength }
}));

const v$ = useVuelidate(rules, formData);

const inputs = ref([
    { 
        id: 1, 
        label: "loginLabel", 
        type: "text", 
        model: "userName", 
        name: "login", 
        placeholder: "loginPlaceholder",
        errorKey: "userName" 
    },
    { 
        id: 2, 
        label: "passwordLabel", 
        type: "password", 
        model: "password", 
        name: "password", 
        placeholder: "passwordPlaceholder",
        errorKey: "password"  
    },
]);

const { mutate: loginMutate } = useMutation({
    mutationFn: (body) => loginUser(body),
    onSuccess: (data) => {
        const { 
            token, 
            user: {
                id,
                role, 
                fullName, 
                organizationName,
                organizationId,
                roleId
            }
        } = data;

        localStorage.setItem("id", id);
        localStorage.setItem("token", token);
        localStorage.setItem("name", fullName);
        localStorage.setItem("role", role);
        localStorage.setItem("organization", organizationName);
        localStorage.setItem("organizationId", organizationId);
        localStorage.setItem("roleId", roleId);

        router.push("/");
        toast.success(t("signInToast"));

        formData.value = clearForm(formData.value);
        v$.value.$reset();
    }
});

const authHandler = () => {
    v$.value.$validate();

    if (v$.value.$errors.length) {
        return;
    }

    loginMutate(formData.value);
}
</script>

<style lang="scss" scoped>
.auth {
    background: radial-gradient(103.88% 58.43% at 56.74% 50%, #0085FF 0%, #003465 100%);
    color: var(--white);
    &__inner {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }
    &__wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        border-radius: 40px;
        border: 3px solid rgba(88, 130, 193, 0.49);
        background: rgba(88, 130, 193, 0.28);
        backdrop-filter: blur(12.5px);
        max-width: 690px;
        width: 100%;
        padding: 55px;
        @media (max-width: 768px) {
            padding: 55px 20px;
        }
        @media (max-width: 480px) {
            padding: 35px 20px;
        }
    }
    &__logo {
        margin-bottom: 20px;
    }
    &__title {
        font-size: 38px;
        font-weight: 700;
        margin-bottom: 25px;
        @media (max-width: 1024px) {
            font-size: 32px;
        }
        @media (max-width: 480px) {
            font-size: 28px;
            margin-bottom: 20px;
        }
        @media (max-width: 360px) {
            font-size: 24px;
            margin-bottom: 16px;
        }
        @media (max-width: 320px) {
            font-size: 22px;
        }
    }
    &__form {
        display: flex;
        flex-direction: column;
        max-width: 500px;
        width: 100%;
        margin-bottom: 30px;
    }
    &__label {
        width: 100%;
        margin-bottom: 30px;
        @media (max-width: 480px) {
            margin-bottom: 20px;
        }
        &-wrapper {
            position: relative;
        }
        &-icon {
            position: absolute;
            top: 65%;
            transform: translateY(-50%);
            right: 20px;
        }
    }
    &__input {
        width: 100%;
        height: 50px;
        padding: 0 50px 0 25px;
        border-radius: 10px;
        border: 1px solid var(--light);
        color: var(--black);
        margin-top: 5px;
        @media (max-width: 480px) {
            height: 40px;
        }
        &::placeholder {
            font-size: 14px;
            font-weight: 400;
            color: var(--light);
        }
    }
    &__submit {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 20px;
        font-weight: 700;
        color: #fff;
        background-color: var(--dark-blue);
        height: 50px;
        width: 100%;
        padding: 10px;
        border-radius: 10px;
        @media (max-width: 480px) {
            font-size: 18px;
            height: 40px;
        }
    }
}

@media (hover: hover) {
    .auth {
        &__submit {
            transition: 0.5s;
            &:hover {
                background-color: var(--black);
            }
        }
    }
}
</style>