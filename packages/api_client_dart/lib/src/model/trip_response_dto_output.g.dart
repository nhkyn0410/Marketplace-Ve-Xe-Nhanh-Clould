// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'trip_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const TripResponseDtoOutputStatusEnum _$tripResponseDtoOutputStatusEnum_DRAFT =
    const TripResponseDtoOutputStatusEnum._('DRAFT');
const TripResponseDtoOutputStatusEnum
    _$tripResponseDtoOutputStatusEnum_OPEN_FOR_SALE =
    const TripResponseDtoOutputStatusEnum._('OPEN_FOR_SALE');
const TripResponseDtoOutputStatusEnum
    _$tripResponseDtoOutputStatusEnum_SOLD_OUT =
    const TripResponseDtoOutputStatusEnum._('SOLD_OUT');
const TripResponseDtoOutputStatusEnum _$tripResponseDtoOutputStatusEnum_LOCKED =
    const TripResponseDtoOutputStatusEnum._('LOCKED');
const TripResponseDtoOutputStatusEnum
    _$tripResponseDtoOutputStatusEnum_BOARDING =
    const TripResponseDtoOutputStatusEnum._('BOARDING');
const TripResponseDtoOutputStatusEnum
    _$tripResponseDtoOutputStatusEnum_DEPARTED =
    const TripResponseDtoOutputStatusEnum._('DEPARTED');
const TripResponseDtoOutputStatusEnum
    _$tripResponseDtoOutputStatusEnum_IN_PROGRESS =
    const TripResponseDtoOutputStatusEnum._('IN_PROGRESS');
const TripResponseDtoOutputStatusEnum
    _$tripResponseDtoOutputStatusEnum_COMPLETED =
    const TripResponseDtoOutputStatusEnum._('COMPLETED');
const TripResponseDtoOutputStatusEnum
    _$tripResponseDtoOutputStatusEnum_CANCELLED =
    const TripResponseDtoOutputStatusEnum._('CANCELLED');
const TripResponseDtoOutputStatusEnum
    _$tripResponseDtoOutputStatusEnum_INCIDENT =
    const TripResponseDtoOutputStatusEnum._('INCIDENT');

TripResponseDtoOutputStatusEnum _$tripResponseDtoOutputStatusEnumValueOf(
    String name) {
  switch (name) {
    case 'DRAFT':
      return _$tripResponseDtoOutputStatusEnum_DRAFT;
    case 'OPEN_FOR_SALE':
      return _$tripResponseDtoOutputStatusEnum_OPEN_FOR_SALE;
    case 'SOLD_OUT':
      return _$tripResponseDtoOutputStatusEnum_SOLD_OUT;
    case 'LOCKED':
      return _$tripResponseDtoOutputStatusEnum_LOCKED;
    case 'BOARDING':
      return _$tripResponseDtoOutputStatusEnum_BOARDING;
    case 'DEPARTED':
      return _$tripResponseDtoOutputStatusEnum_DEPARTED;
    case 'IN_PROGRESS':
      return _$tripResponseDtoOutputStatusEnum_IN_PROGRESS;
    case 'COMPLETED':
      return _$tripResponseDtoOutputStatusEnum_COMPLETED;
    case 'CANCELLED':
      return _$tripResponseDtoOutputStatusEnum_CANCELLED;
    case 'INCIDENT':
      return _$tripResponseDtoOutputStatusEnum_INCIDENT;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<TripResponseDtoOutputStatusEnum>
    _$tripResponseDtoOutputStatusEnumValues = BuiltSet<
        TripResponseDtoOutputStatusEnum>(const <TripResponseDtoOutputStatusEnum>[
  _$tripResponseDtoOutputStatusEnum_DRAFT,
  _$tripResponseDtoOutputStatusEnum_OPEN_FOR_SALE,
  _$tripResponseDtoOutputStatusEnum_SOLD_OUT,
  _$tripResponseDtoOutputStatusEnum_LOCKED,
  _$tripResponseDtoOutputStatusEnum_BOARDING,
  _$tripResponseDtoOutputStatusEnum_DEPARTED,
  _$tripResponseDtoOutputStatusEnum_IN_PROGRESS,
  _$tripResponseDtoOutputStatusEnum_COMPLETED,
  _$tripResponseDtoOutputStatusEnum_CANCELLED,
  _$tripResponseDtoOutputStatusEnum_INCIDENT,
]);

Serializer<TripResponseDtoOutputStatusEnum>
    _$tripResponseDtoOutputStatusEnumSerializer =
    _$TripResponseDtoOutputStatusEnumSerializer();

class _$TripResponseDtoOutputStatusEnumSerializer
    implements PrimitiveSerializer<TripResponseDtoOutputStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'DRAFT': 'DRAFT',
    'OPEN_FOR_SALE': 'OPEN_FOR_SALE',
    'SOLD_OUT': 'SOLD_OUT',
    'LOCKED': 'LOCKED',
    'BOARDING': 'BOARDING',
    'DEPARTED': 'DEPARTED',
    'IN_PROGRESS': 'IN_PROGRESS',
    'COMPLETED': 'COMPLETED',
    'CANCELLED': 'CANCELLED',
    'INCIDENT': 'INCIDENT',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'DRAFT': 'DRAFT',
    'OPEN_FOR_SALE': 'OPEN_FOR_SALE',
    'SOLD_OUT': 'SOLD_OUT',
    'LOCKED': 'LOCKED',
    'BOARDING': 'BOARDING',
    'DEPARTED': 'DEPARTED',
    'IN_PROGRESS': 'IN_PROGRESS',
    'COMPLETED': 'COMPLETED',
    'CANCELLED': 'CANCELLED',
    'INCIDENT': 'INCIDENT',
  };

  @override
  final Iterable<Type> types = const <Type>[TripResponseDtoOutputStatusEnum];
  @override
  final String wireName = 'TripResponseDtoOutputStatusEnum';

  @override
  Object serialize(
          Serializers serializers, TripResponseDtoOutputStatusEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  TripResponseDtoOutputStatusEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      TripResponseDtoOutputStatusEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$TripResponseDtoOutput extends TripResponseDtoOutput {
  @override
  final String id;
  @override
  final String routeId;
  @override
  final String routeName;
  @override
  final String? vehicleId;
  @override
  final String? vehiclePlateNumber;
  @override
  final DateTime departureAt;
  @override
  final DateTime arrivalAt;
  @override
  final TripResponseDtoOutputStatusEnum status;
  @override
  final int seatCount;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
  @override
  final String? note;
  @override
  final BuiltList<TripResponseDtoOutputStopsInner> stops;
  @override
  final BuiltList<TripResponseDtoOutputSeatsInner> seats;

  factory _$TripResponseDtoOutput(
          [void Function(TripResponseDtoOutputBuilder)? updates]) =>
      (TripResponseDtoOutputBuilder()..update(updates))._build();

  _$TripResponseDtoOutput._(
      {required this.id,
      required this.routeId,
      required this.routeName,
      this.vehicleId,
      this.vehiclePlateNumber,
      required this.departureAt,
      required this.arrivalAt,
      required this.status,
      required this.seatCount,
      required this.createdAt,
      required this.updatedAt,
      this.note,
      required this.stops,
      required this.seats})
      : super._();
  @override
  TripResponseDtoOutput rebuild(
          void Function(TripResponseDtoOutputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  TripResponseDtoOutputBuilder toBuilder() =>
      TripResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is TripResponseDtoOutput &&
        id == other.id &&
        routeId == other.routeId &&
        routeName == other.routeName &&
        vehicleId == other.vehicleId &&
        vehiclePlateNumber == other.vehiclePlateNumber &&
        departureAt == other.departureAt &&
        arrivalAt == other.arrivalAt &&
        status == other.status &&
        seatCount == other.seatCount &&
        createdAt == other.createdAt &&
        updatedAt == other.updatedAt &&
        note == other.note &&
        stops == other.stops &&
        seats == other.seats;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, routeId.hashCode);
    _$hash = $jc(_$hash, routeName.hashCode);
    _$hash = $jc(_$hash, vehicleId.hashCode);
    _$hash = $jc(_$hash, vehiclePlateNumber.hashCode);
    _$hash = $jc(_$hash, departureAt.hashCode);
    _$hash = $jc(_$hash, arrivalAt.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, seatCount.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, updatedAt.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jc(_$hash, stops.hashCode);
    _$hash = $jc(_$hash, seats.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'TripResponseDtoOutput')
          ..add('id', id)
          ..add('routeId', routeId)
          ..add('routeName', routeName)
          ..add('vehicleId', vehicleId)
          ..add('vehiclePlateNumber', vehiclePlateNumber)
          ..add('departureAt', departureAt)
          ..add('arrivalAt', arrivalAt)
          ..add('status', status)
          ..add('seatCount', seatCount)
          ..add('createdAt', createdAt)
          ..add('updatedAt', updatedAt)
          ..add('note', note)
          ..add('stops', stops)
          ..add('seats', seats))
        .toString();
  }
}

class TripResponseDtoOutputBuilder
    implements Builder<TripResponseDtoOutput, TripResponseDtoOutputBuilder> {
  _$TripResponseDtoOutput? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _routeId;
  String? get routeId => _$this._routeId;
  set routeId(String? routeId) => _$this._routeId = routeId;

  String? _routeName;
  String? get routeName => _$this._routeName;
  set routeName(String? routeName) => _$this._routeName = routeName;

  String? _vehicleId;
  String? get vehicleId => _$this._vehicleId;
  set vehicleId(String? vehicleId) => _$this._vehicleId = vehicleId;

  String? _vehiclePlateNumber;
  String? get vehiclePlateNumber => _$this._vehiclePlateNumber;
  set vehiclePlateNumber(String? vehiclePlateNumber) =>
      _$this._vehiclePlateNumber = vehiclePlateNumber;

  DateTime? _departureAt;
  DateTime? get departureAt => _$this._departureAt;
  set departureAt(DateTime? departureAt) => _$this._departureAt = departureAt;

  DateTime? _arrivalAt;
  DateTime? get arrivalAt => _$this._arrivalAt;
  set arrivalAt(DateTime? arrivalAt) => _$this._arrivalAt = arrivalAt;

  TripResponseDtoOutputStatusEnum? _status;
  TripResponseDtoOutputStatusEnum? get status => _$this._status;
  set status(TripResponseDtoOutputStatusEnum? status) =>
      _$this._status = status;

  int? _seatCount;
  int? get seatCount => _$this._seatCount;
  set seatCount(int? seatCount) => _$this._seatCount = seatCount;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  DateTime? _updatedAt;
  DateTime? get updatedAt => _$this._updatedAt;
  set updatedAt(DateTime? updatedAt) => _$this._updatedAt = updatedAt;

  String? _note;
  String? get note => _$this._note;
  set note(String? note) => _$this._note = note;

  ListBuilder<TripResponseDtoOutputStopsInner>? _stops;
  ListBuilder<TripResponseDtoOutputStopsInner> get stops =>
      _$this._stops ??= ListBuilder<TripResponseDtoOutputStopsInner>();
  set stops(ListBuilder<TripResponseDtoOutputStopsInner>? stops) =>
      _$this._stops = stops;

  ListBuilder<TripResponseDtoOutputSeatsInner>? _seats;
  ListBuilder<TripResponseDtoOutputSeatsInner> get seats =>
      _$this._seats ??= ListBuilder<TripResponseDtoOutputSeatsInner>();
  set seats(ListBuilder<TripResponseDtoOutputSeatsInner>? seats) =>
      _$this._seats = seats;

  TripResponseDtoOutputBuilder() {
    TripResponseDtoOutput._defaults(this);
  }

  TripResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _routeId = $v.routeId;
      _routeName = $v.routeName;
      _vehicleId = $v.vehicleId;
      _vehiclePlateNumber = $v.vehiclePlateNumber;
      _departureAt = $v.departureAt;
      _arrivalAt = $v.arrivalAt;
      _status = $v.status;
      _seatCount = $v.seatCount;
      _createdAt = $v.createdAt;
      _updatedAt = $v.updatedAt;
      _note = $v.note;
      _stops = $v.stops.toBuilder();
      _seats = $v.seats.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(TripResponseDtoOutput other) {
    _$v = other as _$TripResponseDtoOutput;
  }

  @override
  void update(void Function(TripResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  TripResponseDtoOutput build() => _build();

  _$TripResponseDtoOutput _build() {
    _$TripResponseDtoOutput _$result;
    try {
      _$result = _$v ??
          _$TripResponseDtoOutput._(
            id: BuiltValueNullFieldError.checkNotNull(
                id, r'TripResponseDtoOutput', 'id'),
            routeId: BuiltValueNullFieldError.checkNotNull(
                routeId, r'TripResponseDtoOutput', 'routeId'),
            routeName: BuiltValueNullFieldError.checkNotNull(
                routeName, r'TripResponseDtoOutput', 'routeName'),
            vehicleId: vehicleId,
            vehiclePlateNumber: vehiclePlateNumber,
            departureAt: BuiltValueNullFieldError.checkNotNull(
                departureAt, r'TripResponseDtoOutput', 'departureAt'),
            arrivalAt: BuiltValueNullFieldError.checkNotNull(
                arrivalAt, r'TripResponseDtoOutput', 'arrivalAt'),
            status: BuiltValueNullFieldError.checkNotNull(
                status, r'TripResponseDtoOutput', 'status'),
            seatCount: BuiltValueNullFieldError.checkNotNull(
                seatCount, r'TripResponseDtoOutput', 'seatCount'),
            createdAt: BuiltValueNullFieldError.checkNotNull(
                createdAt, r'TripResponseDtoOutput', 'createdAt'),
            updatedAt: BuiltValueNullFieldError.checkNotNull(
                updatedAt, r'TripResponseDtoOutput', 'updatedAt'),
            note: note,
            stops: stops.build(),
            seats: seats.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'stops';
        stops.build();
        _$failedField = 'seats';
        seats.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'TripResponseDtoOutput', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
