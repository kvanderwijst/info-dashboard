import { computed } from 'vue';
import { useTheme } from 'vuetify';

export function useEChartsTheme() {
    const theme = useTheme();

    const colors = computed(() => {
        const c = theme.global.current.value.colors;
        return [
            c.primary,
            c.secondary,
            c.info,
            c.success,
            c.warning,
            c.error
        ];
    });

    const axisColor = computed(() =>
        theme.global.current.value.dark ? '#bbb' : '#555'
    );

    return {
        colors,
        axisColor
    };
}
