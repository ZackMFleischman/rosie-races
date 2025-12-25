import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  Popover,
  Slider,
  Stack,
  Switch,
  Typography,
  styled,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useGame } from '../hooks/useGame';
import type { Operation } from '../game/systems/MathGenerator';

const SettingsButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  top: theme.spacing(1),
  right: theme.spacing(9),
  zIndex: 1100,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  '&:hover': {
    backgroundColor: theme.palette.background.paper,
  },
}));

export interface SettingsMenuProps {
  /** Position the button at the bottom-right instead of top-right */
  bottomRight?: boolean;
}

const operationLabels: Record<Operation, string> = {
  add: 'Addition (+)',
  subtract: 'Subtraction (−)',
  multiply: 'Multiplication (×)',
  divide: 'Division (÷)',
  square: 'Squares (²)',
};

export function SettingsMenu({ bottomRight = false }: SettingsMenuProps) {
  const { speedScale, setSpeedScale, mathConfig, setMathConfig } = useGame();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleSettingsClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl((prev) => (prev ? null : event.currentTarget));
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleSpeedChange = useCallback(
    (_event: Event, newValue: number | number[]) => {
      const value = Array.isArray(newValue) ? newValue[0] : newValue;
      setSpeedScale(value);
    },
    [setSpeedScale]
  );

  const handleMaxNumberChange = useCallback(
    (_event: Event, newValue: number | number[]) => {
      const value = Array.isArray(newValue) ? newValue[0] : newValue;
      setMathConfig((prev) => ({
        ...prev,
        maxNumber: value,
      }));
    },
    [setMathConfig]
  );

  const operationToggles = useMemo(() => {
    return (Object.keys(operationLabels) as Operation[]).map((operation) => {
      const checked = mathConfig.operations.includes(operation);
      return (
        <FormControlLabel
          key={operation}
          control={
            <Switch
              checked={checked}
              onChange={(_event, nextChecked) => {
                setMathConfig((prev) => {
                  const nextOperations = nextChecked
                    ? [...prev.operations, operation]
                    : prev.operations.filter((op) => op !== operation);

                  if (nextOperations.length === 0) {
                    return prev;
                  }

                  return {
                    ...prev,
                    operations: nextOperations,
                  };
                });
              }}
            />
          }
          label={operationLabels[operation]}
        />
      );
    });
  }, [mathConfig.operations, setMathConfig]);

  const open = Boolean(anchorEl);
  const id = open ? 'settings-popover' : undefined;

  return (
    <>
      <SettingsButton
        aria-describedby={id}
        aria-label="Open difficulty settings"
        onClick={handleSettingsClick}
        size="large"
        sx={bottomRight ? { top: 'auto', bottom: 8 } : undefined}
        data-ignore-global-tap="true"
      >
        <SettingsIcon />
      </SettingsButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: bottomRight ? 'top' : 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: bottomRight ? 'bottom' : 'top',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 2,
              minWidth: 280,
            },
            'data-ignore-global-tap': 'true',
          },
        }}
      >
        <Stack spacing={2} data-ignore-global-tap="true">
          <Box>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Player Speed
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Scale computer player max speed
            </Typography>
            <Slider
              value={speedScale}
              onChange={handleSpeedChange}
              min={0.4}
              max={1.4}
              step={0.05}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
              aria-label="Computer player speed scale"
            />
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Math Questions
            </Typography>
            <FormGroup>{operationToggles}</FormGroup>

            <Box mt={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Max number in questions: {mathConfig.maxNumber}
              </Typography>
              <Slider
                value={mathConfig.maxNumber}
                onChange={handleMaxNumberChange}
                min={5}
                max={30}
                step={1}
                valueLabelDisplay="auto"
                aria-label="Maximum number for math questions"
              />
            </Box>
          </Box>
        </Stack>
      </Popover>
    </>
  );
}

export default SettingsMenu;
