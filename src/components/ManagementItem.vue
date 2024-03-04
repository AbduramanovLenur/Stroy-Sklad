<template>
    <li class="management__item">
        <router-link class="management__link" :to="menu.to">
            <span class="management__link-icon">
                <Icon 
                    :name="menu.icon" 
                    :className="menu.className"
                />
            </span>
            <span class="management__link-text">
                {{ $t(menu.label) }}
            </span>
        </router-link>
    </li>
</template>

<script setup>
defineProps(["menu"]);
</script>

<style lang="scss" scoped>
.management {
    &__item {
        width: 100%;
    }
    &__link {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 50px;
        border: 1px solid #0054A3;
        border-radius: 20px;
        padding: 50px 20px;
        -webkit-box-shadow: 0px 0px 17px 4px rgba(0,0,0,0.39); 
        box-shadow: 0px 0px 17px 4px rgba(0,0,0,0.39);

        @media (max-width: 1350px) {
            gap: 25px;
            padding: 40px 25px;
        }

        @media (max-width: 768px) {
            gap: 20px;
            padding: 35px 25px;
        }

        @media (max-width: 480px) {
            gap: 15px;
            padding: 25px 20px;
        }
        
        &-icon {
            display: flex;
            align-items: center;
        }
        &-text {
            font-size: 25px;
            @media (max-width: 1350px) {
                font-size: 22px;
            }
            @media (max-width: 480px) {
                font-size: 20px;
            }
        }
    }
}
</style>