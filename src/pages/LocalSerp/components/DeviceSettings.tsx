import React from 'react';
import { DEVICES, OS_OPTIONS } from '../constants';

interface DeviceSettingsProps {
  device: 'desktop' | 'mobile';
  os: string;
  onDeviceChange: (device: 'desktop' | 'mobile') => void;
  onOsChange: (os: string) => void;
}

export function DeviceSettings({
  device,
  os,
  onDeviceChange,
  onOsChange
}: DeviceSettingsProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Device
        </label>
        <select
          value={device}
          onChange={(e) => onDeviceChange(e.target.value as 'desktop' | 'mobile')}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value={DEVICES.DESKTOP}>Desktop</option>
          <option value={DEVICES.MOBILE}>Mobile</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Operating System
        </label>
        <select
          value={os}
          onChange={(e) => onOsChange(e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {device === DEVICES.DESKTOP ? (
            <>
              <option value={OS_OPTIONS.DESKTOP.WINDOWS}>Windows</option>
              <option value={OS_OPTIONS.DESKTOP.MACOS}>macOS</option>
            </>
          ) : (
            <>
              <option value={OS_OPTIONS.MOBILE.ANDROID}>Android</option>
              <option value={OS_OPTIONS.MOBILE.IOS}>iOS</option>
            </>
          )}
        </select>
      </div>
    </>
  );
}