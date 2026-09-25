// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'seat_map_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SeatMapResponseDtoOutput extends SeatMapResponseDtoOutput {
  @override
  final String id;
  @override
  final String name;
  @override
  final int seatCount;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
  @override
  final SeatMapResponseDtoOutputLayout layout;
  @override
  final BuiltList<SeatMapResponseDtoOutputSeatsInner> seats;

  factory _$SeatMapResponseDtoOutput(
          [void Function(SeatMapResponseDtoOutputBuilder)? updates]) =>
      (SeatMapResponseDtoOutputBuilder()..update(updates))._build();

  _$SeatMapResponseDtoOutput._(
      {required this.id,
      required this.name,
      required this.seatCount,
      required this.createdAt,
      required this.updatedAt,
      required this.layout,
      required this.seats})
      : super._();
  @override
  SeatMapResponseDtoOutput rebuild(
          void Function(SeatMapResponseDtoOutputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SeatMapResponseDtoOutputBuilder toBuilder() =>
      SeatMapResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SeatMapResponseDtoOutput &&
        id == other.id &&
        name == other.name &&
        seatCount == other.seatCount &&
        createdAt == other.createdAt &&
        updatedAt == other.updatedAt &&
        layout == other.layout &&
        seats == other.seats;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, seatCount.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, updatedAt.hashCode);
    _$hash = $jc(_$hash, layout.hashCode);
    _$hash = $jc(_$hash, seats.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SeatMapResponseDtoOutput')
          ..add('id', id)
          ..add('name', name)
          ..add('seatCount', seatCount)
          ..add('createdAt', createdAt)
          ..add('updatedAt', updatedAt)
          ..add('layout', layout)
          ..add('seats', seats))
        .toString();
  }
}

class SeatMapResponseDtoOutputBuilder
    implements
        Builder<SeatMapResponseDtoOutput, SeatMapResponseDtoOutputBuilder> {
  _$SeatMapResponseDtoOutput? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  int? _seatCount;
  int? get seatCount => _$this._seatCount;
  set seatCount(int? seatCount) => _$this._seatCount = seatCount;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  DateTime? _updatedAt;
  DateTime? get updatedAt => _$this._updatedAt;
  set updatedAt(DateTime? updatedAt) => _$this._updatedAt = updatedAt;

  SeatMapResponseDtoOutputLayoutBuilder? _layout;
  SeatMapResponseDtoOutputLayoutBuilder get layout =>
      _$this._layout ??= SeatMapResponseDtoOutputLayoutBuilder();
  set layout(SeatMapResponseDtoOutputLayoutBuilder? layout) =>
      _$this._layout = layout;

  ListBuilder<SeatMapResponseDtoOutputSeatsInner>? _seats;
  ListBuilder<SeatMapResponseDtoOutputSeatsInner> get seats =>
      _$this._seats ??= ListBuilder<SeatMapResponseDtoOutputSeatsInner>();
  set seats(ListBuilder<SeatMapResponseDtoOutputSeatsInner>? seats) =>
      _$this._seats = seats;

  SeatMapResponseDtoOutputBuilder() {
    SeatMapResponseDtoOutput._defaults(this);
  }

  SeatMapResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _name = $v.name;
      _seatCount = $v.seatCount;
      _createdAt = $v.createdAt;
      _updatedAt = $v.updatedAt;
      _layout = $v.layout.toBuilder();
      _seats = $v.seats.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SeatMapResponseDtoOutput other) {
    _$v = other as _$SeatMapResponseDtoOutput;
  }

  @override
  void update(void Function(SeatMapResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SeatMapResponseDtoOutput build() => _build();

  _$SeatMapResponseDtoOutput _build() {
    _$SeatMapResponseDtoOutput _$result;
    try {
      _$result = _$v ??
          _$SeatMapResponseDtoOutput._(
            id: BuiltValueNullFieldError.checkNotNull(
                id, r'SeatMapResponseDtoOutput', 'id'),
            name: BuiltValueNullFieldError.checkNotNull(
                name, r'SeatMapResponseDtoOutput', 'name'),
            seatCount: BuiltValueNullFieldError.checkNotNull(
                seatCount, r'SeatMapResponseDtoOutput', 'seatCount'),
            createdAt: BuiltValueNullFieldError.checkNotNull(
                createdAt, r'SeatMapResponseDtoOutput', 'createdAt'),
            updatedAt: BuiltValueNullFieldError.checkNotNull(
                updatedAt, r'SeatMapResponseDtoOutput', 'updatedAt'),
            layout: layout.build(),
            seats: seats.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'layout';
        layout.build();
        _$failedField = 'seats';
        seats.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'SeatMapResponseDtoOutput', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
