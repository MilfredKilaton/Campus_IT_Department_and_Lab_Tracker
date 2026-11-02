using CITA_LT_Final_Project.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. THIS LINE REGISTERS THE CONTROLLERS (Make sure it's here!)
builder.Services.AddControllers();

// 2. REGISTER YOUR CUSTOM SERVICE
builder.Services.AddSingleton<AssetService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

// (We commented out UseHttpsRedirection, which is fine)
// app.UseHttpsRedirection(); 

app.UseAuthorization();

// 3. THIS LINE MAPS THE CONTROLLERS TO THE ROUTES
app.MapControllers();

app.Run();