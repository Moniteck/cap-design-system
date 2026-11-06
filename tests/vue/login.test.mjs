import { mount } from '@vue/test-utils';
import CapLogin from '../../design/vue/CapLogin.vue';

const baseProps = {
  systemName: 'Facturación',
  tagline: 'Emite, cobra y revisa desde un mismo lugar.',
  helpEmail: 'mesadeayuda@cap.cl',
};

const mountLogin = (props = {}) => mount(CapLogin, { props: { ...baseProps, ...props } });

test('a single provider takes the full width', () => {
  const wrapper = mountLogin({ providers: ['microsoft'] });
  expect(wrapper.find('.cap-login__providers').classes()).toContain('cap-login__providers--single');
  expect(wrapper.findAll('.cap-button--provider')).toHaveLength(1);
});

test('two providers do not use the single modifier', () => {
  const wrapper = mountLogin({ providers: ['microsoft', 'google'] });
  expect(wrapper.find('.cap-login__providers').classes()).not.toContain('cap-login__providers--single');
});

test('hides the provider block without providers', () => {
  const wrapper = mountLogin();
  expect(wrapper.find('.cap-login__providers').exists()).toBe(false);
  expect(wrapper.find('.cap-login__divider').exists()).toBe(false);
});

test('emits provider with its name', async () => {
  const wrapper = mountLogin({ providers: ['google'] });
  await wrapper.find('.cap-button--provider').trigger('click');
  expect(wrapper.emitted('provider')[0]).toEqual(['google']);
});

test('loading disables and labels the submit button', () => {
  const submit = mountLogin({ loading: true }).find('.cap-login__submit');
  expect(submit.attributes('disabled')).toBeDefined();
  expect(submit.attributes('aria-busy')).toBe('true');
  expect(submit.text()).toBe('Ingresando…');
});

test('shows an error alert above the form fields', () => {
  const wrapper = mountLogin({ alert: { status: 'error', title: 'Correo o contraseña incorrectos', detail: 'Te quedan 2 intentos.' } });
  const alert = wrapper.find('.cap-alert');
  expect(alert.attributes('role')).toBe('alert');
  expect(alert.text()).toContain('Te quedan 2 intentos.');
  const html = wrapper.html();
  expect(html.indexOf('cap-alert')).toBeLessThan(html.indexOf('cap-field'));
  expect(wrapper.find('#login-password-field').classes()).toContain('cap-field--error');
});

test('emits submit with the typed credentials', async () => {
  const wrapper = mountLogin();
  await wrapper.find('input[type="email"]').setValue('amunoz@cap.cl');
  await wrapper.find('input[autocomplete="current-password"]').setValue('secreto');
  await wrapper.find('input[type="checkbox"]').setValue(true);
  await wrapper.find('form').trigger('submit');
  expect(wrapper.emitted('submit')[0]).toEqual([{ email: 'amunoz@cap.cl', password: 'secreto', remember: true }]);
});

test('reveals and hides the password', async () => {
  const wrapper = mountLogin();
  const input = wrapper.find('input[autocomplete="current-password"]');
  await wrapper.find('.cap-field__reveal').trigger('click');
  expect(input.attributes('type')).toBe('text');
  expect(wrapper.find('.cap-field__reveal').attributes('aria-label')).toBe('Ocultar contraseña');
  await wrapper.find('.cap-field__reveal').trigger('click');
  expect(input.attributes('type')).toBe('password');
});

test('emits forgot from the recovery link', async () => {
  const wrapper = mountLogin();
  await wrapper.find('.cap-login__options .cap-login__link').trigger('click');
  expect(wrapper.emitted('forgot')).toHaveLength(1);
});

test('recover mode shows the recovery form and emits recover and back', async () => {
  const wrapper = mountLogin({ mode: 'recover' });
  expect(wrapper.text()).toContain('Recupera tu acceso');
  expect(wrapper.text()).toContain('Volver a ingresar');
  await wrapper.find('input[type="email"]').setValue('amunoz@cap.cl');
  await wrapper.find('form').trigger('submit');
  expect(wrapper.emitted('recover')[0]).toEqual(['amunoz@cap.cl']);
  await wrapper.find('.cap-login__help .cap-login__link').trigger('click');
  expect(wrapper.emitted('back')).toHaveLength(1);
});

test('uses the photo only when provided', () => {
  expect(mountLogin().find('.cap-login__photo').attributes('style')).toBeUndefined();
  const withPhoto = mountLogin({ photoUrl: 'https://example.test/foto.jpg' });
  expect(withPhoto.find('.cap-login__photo').attributes('style')).toContain('https://example.test/foto.jpg');
});
