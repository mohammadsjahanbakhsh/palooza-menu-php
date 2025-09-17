// In src/pages/Login.tsx

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    const response = await fetch('/api/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      // Login was successful, save the REAL user object from the API
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      
      toast({
        title: "ورود موفق",
        description: `خوش آمدید, ${data.user.full_name}`,
      });
      
      navigate("/dashboard");
    } else {
      // Login failed on the server
      throw new Error(data.error || 'Invalid credentials.');
    }
  } catch (error) {
    console.error("Login error:", error);
    toast({
      title: "خطا در ورود",
      description: (error as Error).message,
      variant: "destructive"
    });
  } finally {
    setIsLoading(false);
  }
};