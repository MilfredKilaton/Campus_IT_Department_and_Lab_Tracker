using System;

namespace CITA_LT_Final_Project.Interfaces
{
    public interface IBorrowable
    {
        bool IsCheckedOut { get; }
        string? BorrowerId { get; }
        void CheckOut(string borrowedId);
        void CheckIn();
    }
}