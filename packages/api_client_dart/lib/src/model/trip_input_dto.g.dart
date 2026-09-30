// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'trip_input_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$TripInputDto extends TripInputDto {
  @override
  final String routeId;
  @override
  final String? vehicleId;
  @override
  final DateTime departureAt;
  @override
  final DateTime arrivalAt;
  @override
  final BuiltList<DateTime>? stopTimes;
  @override
  final String? note;

  factory _$TripInputDto([void Function(TripInputDtoBuilder)? updates]) =>
      (TripInputDtoBuilder()..update(updates))._build();

  _$TripInputDto._(
      {required this.routeId,
      this.vehicleId,
      required this.departureAt,
      required this.arrivalAt,
      this.stopTimes,
      this.note})
      : super._();
  @override
  TripInputDto rebuild(void Function(TripInputDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  TripInputDtoBuilder toBuilder() => TripInputDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is TripInputDto &&
        routeId == other.routeId &&
        vehicleId == other.vehicleId &&
        departureAt == other.departureAt &&
        arrivalAt == other.arrivalAt &&
        stopTimes == other.stopTimes &&
        note == other.note;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, routeId.hashCode);
    _$hash = $jc(_$hash, vehicleId.hashCode);
    _$hash = $jc(_$hash, departureAt.hashCode);
    _$hash = $jc(_$hash, arrivalAt.hashCode);
    _$hash = $jc(_$hash, stopTimes.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'TripInputDto')
          ..add('routeId', routeId)
          ..add('vehicleId', vehicleId)
          ..add('departureAt', departureAt)
          ..add('arrivalAt', arrivalAt)
          ..add('stopTimes', stopTimes)
          ..add('note', note))
        .toString();
  }
}

class TripInputDtoBuilder
    implements Builder<TripInputDto, TripInputDtoBuilder> {
  _$TripInputDto? _$v;

  String? _routeId;
  String? get routeId => _$this._routeId;
  set routeId(String? routeId) => _$this._routeId = routeId;

  String? _vehicleId;
  String? get vehicleId => _$this._vehicleId;
  set vehicleId(String? vehicleId) => _$this._vehicleId = vehicleId;

  DateTime? _departureAt;
  DateTime? get departureAt => _$this._departureAt;
  set departureAt(DateTime? departureAt) => _$this._departureAt = departureAt;

  DateTime? _arrivalAt;
  DateTime? get arrivalAt => _$this._arrivalAt;
  set arrivalAt(DateTime? arrivalAt) => _$this._arrivalAt = arrivalAt;

  ListBuilder<DateTime>? _stopTimes;
  ListBuilder<DateTime> get stopTimes =>
      _$this._stopTimes ??= ListBuilder<DateTime>();
  set stopTimes(ListBuilder<DateTime>? stopTimes) =>
      _$this._stopTimes = stopTimes;

  String? _note;
  String? get note => _$this._note;
  set note(String? note) => _$this._note = note;

  TripInputDtoBuilder() {
    TripInputDto._defaults(this);
  }

  TripInputDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _routeId = $v.routeId;
      _vehicleId = $v.vehicleId;
      _departureAt = $v.departureAt;
      _arrivalAt = $v.arrivalAt;
      _stopTimes = $v.stopTimes?.toBuilder();
      _note = $v.note;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(TripInputDto other) {
    _$v = other as _$TripInputDto;
  }

  @override
  void update(void Function(TripInputDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  TripInputDto build() => _build();

  _$TripInputDto _build() {
    _$TripInputDto _$result;
    try {
      _$result = _$v ??
          _$TripInputDto._(
            routeId: BuiltValueNullFieldError.checkNotNull(
                routeId, r'TripInputDto', 'routeId'),
            vehicleId: vehicleId,
            departureAt: BuiltValueNullFieldError.checkNotNull(
                departureAt, r'TripInputDto', 'departureAt'),
            arrivalAt: BuiltValueNullFieldError.checkNotNull(
                arrivalAt, r'TripInputDto', 'arrivalAt'),
            stopTimes: _stopTimes?.build(),
            note: note,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'stopTimes';
        _stopTimes?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'TripInputDto', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
