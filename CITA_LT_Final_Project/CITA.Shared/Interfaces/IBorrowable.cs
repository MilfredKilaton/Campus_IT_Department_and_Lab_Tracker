using System;

namespace CITA.Shared.Interfaces
{
    public interface IBorrowable
    {
        bool IsCheckedOut { get; }
        string? BorrowerId { get; }
        void CheckOut(string borrowedId);
        void CheckIn();
    }
}