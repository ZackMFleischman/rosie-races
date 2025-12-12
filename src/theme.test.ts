import theme from './theme';

describe('theme', () => {
  describe('palette', () => {
    it('has kid-friendly primary color (hot pink)', () => {
      expect(theme.palette.primary.main).toBe('#FF69B4');
    });

    it('has secondary color (purple)', () => {
      expect(theme.palette.secondary.main).toBe('#7B68EE');
    });

    it('has light background color', () => {
      expect(theme.palette.background.default).toBe('#FFF5F8');
    });

    it('has success color for positive feedback', () => {
      expect(theme.palette.success.main).toBe('#50C878');
    });

    it('has error color for gentle error feedback', () => {
      expect(theme.palette.error.main).toBe('#FF6B6B');
    });
  });

  describe('typography', () => {
    it('uses kid-friendly font family', () => {
      expect(theme.typography.fontFamily).toContain('Fredoka');
    });

    it('does not uppercase button text', () => {
      expect(theme.typography.button?.textTransform).toBe('none');
    });
  });

  describe('shape', () => {
    it('has rounded corners for kid-friendly feel', () => {
      expect(theme.shape.borderRadius).toBe(12);
    });
  });

  describe('component overrides', () => {
    it('has touch-friendly button minimum height', () => {
      const buttonRoot = theme.components?.MuiButton?.styleOverrides?.root;
      expect(buttonRoot).toHaveProperty('minHeight', 48);
    });

    it('has touch-friendly icon button minimum size', () => {
      const iconButtonRoot = theme.components?.MuiIconButton?.styleOverrides?.root;
      expect(iconButtonRoot).toHaveProperty('minHeight', 48);
      expect(iconButtonRoot).toHaveProperty('minWidth', 48);
    });
  });
});
