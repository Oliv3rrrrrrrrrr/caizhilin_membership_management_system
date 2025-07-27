// 手机格式验证
export function validatePhone(phone: string): boolean {
  // 中国大陆手机号格式：1开头的11位数字
  const phoneRegex = /^1\d{10}$/;
  return phoneRegex.test(phone);
}

// 密码强度验证
export function validatePassword(password: string): {isValid: boolean; message: string} {
  // 密码长度至少为6位
  if (password.length < 6) {
    return {
      isValid: false,
      message: "密码长度至少为6位",
    };
  }

  // 密码长度不能超过20位
  if (password.length > 20) {
    return {
      isValid: false,
      message: "密码长度不能超过20位",
    };
  }
 
  // 密码正确
  return {
    isValid: true,
    message: "密码格式正确",
  }
}

// 姓名验证
export function validateName(name: string): {isValid: boolean; message: string} {
  // 姓名长度至少2位
  if (name.length < 2) {
    return {
      isValid: false,
      message: "姓名长度至少2位",
    };
  }

  // 姓名长度不能超过20位
  if (name.length > 20) {
    return {
      isValid: false,
      message: "姓名长度不能超过20位",
    };
  }

  // 姓名正确
  return {
    isValid: true,
    message: "姓名格式正确",
  };
}